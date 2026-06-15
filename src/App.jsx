import React, { useState, useEffect, useCallback, useRef } from 'react';
import FloatingNav from './components/FloatingNav';
import ProspectsView from './components/ProspectsView';
import { AuditQueueView, DecksView, SentView, SettingsView } from './components/OtherViews';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { scrapeRestaurants } from './utils/scraper';
import { auditBatch } from './utils/audit';
import Onboarding from './components/Onboarding';
import LoginScreen from './components/LoginScreen';
import { loadRestaurants, saveRestaurants } from './lib/auth';

const ONBOARDING_KEY = 'mesa_onboarding_done';

// Fields that are UI-only and should NOT be persisted to Supabase
const UI_ONLY_FIELDS = ['selected'];

// Strip UI-only fields before saving
function toPersistedRestaurant(r) {
  const out = { ...r };
  UI_ONLY_FIELDS.forEach(k => delete out[k]);
  return out;
}

function MesaApp() {
  const {
    userId, settings, loading,
    locationLabel, searchLocation, dataKey,
    industry, anthropicKey, openaiKey, apifyToken,
  } = useAuth();

  const [view,         setView]        = useState('prospects');
  const [restaurants,  setRestaurantsRaw] = useState([]);
  const [restLoading,  setRestLoading] = useState(false);
  const [scraping,     setScraping]    = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [scrapeError,  setScrapeError]  = useState(null);
  const [auditing,     setAuditing]    = useState(false);
  const [auditStatus,  setAuditStatus]  = useState('');
  const [showOnboard,  setShowOnboard]  = useState(false);

  // Debounce Supabase saves to avoid hammering on rapid state changes
  const saveTimer = useRef(null);
  const saveToSupabase = useCallback((resolved) => {
    if (!userId) return;
    const key = dataKey();
    if (!key || key === 'default') return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const toPersist = resolved.map(toPersistedRestaurant);
      saveRestaurants(userId, key, toPersist).catch(err =>
        console.error('Supabase save failed:', err)
      );
    }, 400); // 400ms debounce
  }, [userId, dataKey]);

  // Atomic state + save: always works from latest state
  const setRestaurants = useCallback((updater) => {
    setRestaurantsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToSupabase(next);
      return next;
    });
  }, [saveToSupabase]);

  // Load from Supabase when location/industry/user changes
  useEffect(() => {
    if (!userId) return;
    const key = dataKey();
    if (!key || key === 'default') { setRestaurantsRaw([]); return; }
    setRestLoading(true);
    loadRestaurants(userId, key)
      .then(data => {
        // Restore with selected: false (UI state is never persisted)
        const withUI = (Array.isArray(data) ? data : []).map(r => ({ ...r, selected: false }));
        setRestaurantsRaw(withUI);
      })
      .catch(err => { console.error('Load failed:', err); setRestaurantsRaw([]); })
      .finally(() => setRestLoading(false));
  }, [userId, settings?.city, settings?.state, settings?.country, settings?.industry]);

  useEffect(() => {
    if (userId && !sessionStorage.getItem(ONBOARDING_KEY)) setShowOnboard(true);
  }, [userId]);

  // UI-only mutations — update state but don't trigger Supabase save
  const toggleSelect = useCallback(id =>
    setRestaurantsRaw(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r))
  , []);
  const selectAll   = useCallback(() =>
    setRestaurantsRaw(prev => prev.map(r => ({ ...r, selected: true })))
  , []);
  const deselectAll = useCallback(() =>
    setRestaurantsRaw(prev => prev.map(r => ({ ...r, selected: false })))
  , []);

  // Persisted mutations — update state AND save to Supabase
  const updateRestaurant = useCallback((id, updates) => {
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setRestaurants]);

  const handleScrape = async () => {
    if (!apifyToken) { setScrapeError('Add your Apify token in Settings first.'); return; }
    const loc = searchLocation();
    if (!loc) { setScrapeError('Set a target location in Settings first.'); return; }
    const { getSearchQuery } = await import('./data/industries');
    const query = getSearchQuery(industry, loc);
    setScraping(true); setScrapeError(null); setScrapeStatus('Starting...');
    try {
      const results = await scrapeRestaurants(apifyToken, query, msg => setScrapeStatus(msg));
      setRestaurants(results.map(r => ({ ...r, selected: false })));
      setScrapeStatus('');
    } catch (err) { setScrapeError(err.message); setScrapeStatus(''); }
    finally { setScraping(false); }
  };

  const handleRunAudit = async (selectedRestaurants) => {
    if (!anthropicKey) { alert('Anthropic API key missing — check Settings.'); return; }
    const toAudit = selectedRestaurants.map(r => ({ ...r }));
    setAuditing(true);
    setAuditStatus(`Starting audit for ${toAudit.length} restaurant${toAudit.length > 1 ? 's' : ''}...`);
    setView('audit');

    // Mark as auditing in UI only (don't persist this transient state)
    setRestaurantsRaw(prev => prev.map(r =>
      toAudit.find(s => s.id === r.id) ? { ...r, status: 'auditing' } : r
    ));

    try {
      const { getIndustry } = await import('./data/industries');
      const industryContext = getIndustry(industry).auditContext;
      const results = await auditBatch(toAudit, anthropicKey, (i, total, name) => {
        setAuditStatus(`Auditing ${name}... (${i + 1} of ${total})`);
      }, industryContext);

      // Save audit results to Supabase
      setRestaurants(prev => prev.map(r => {
        const res = results.find(x => x.id === r.id);
        if (!res) return r;
        return { ...r, audit: res.audit, status: res.status, selected: false };
      }));

      const failed = results.filter(r => r.error);
      if (failed.length) alert(`${results.length - failed.length} audited. ${failed.length} failed:\n${failed.map(f => `• ${f.error}`).join('\n')}`);
    } catch (err) {
      alert('Audit failed: ' + err.message);
      // Reset status but don't persist the failure
      setRestaurantsRaw(prev => prev.map(r =>
        toAudit.find(s => s.id === r.id) ? { ...r, status: 'new' } : r
      ));
    } finally { setAuditing(false); setAuditStatus(''); }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="22" stroke="#2a2a2a" strokeWidth="2"/>
          <circle cx="26" cy="26" r="22" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"
            strokeDasharray="36 102" style={{ transformOrigin: 'center', animation: 'spin 1.2s linear infinite' }}/>
        </svg>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#5c5751', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Loading MESA
        </div>
      </div>
    );
  }

  if (!userId) return <LoginScreen />;

  const counts = {
    total: restaurants.length,
    audit: restaurants.filter(r => r.selected && r.status === 'new').length,
    decks: restaurants.filter(r => ['mocked','audited'].includes(r.status)).length,
    sent:  restaurants.filter(r => ['sent','replied'].includes(r.status)).length,
  };

  const renderView = () => {
    switch (view) {
      case 'prospects': return (
        <ProspectsView
          restaurants={restaurants}
          onToggle={toggleSelect}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onRunAudit={handleRunAudit}
          onScrape={handleScrape}
          scraping={scraping}
          scrapeStatus={scrapeStatus}
          scrapeError={scrapeError}
          onGoSettings={() => setView('settings')}
          locationLabel={locationLabel()}
          restLoading={restLoading}
        />
      );
      case 'audit':    return <AuditQueueView restaurants={restaurants} auditing={auditing} auditStatus={auditStatus} />;
      case 'decks':    return <DecksView restaurants={restaurants} onUpdateRestaurant={updateRestaurant} userId={userId} />;
      case 'sent':     return <SentView restaurants={restaurants} />;
      case 'settings': return <SettingsView />;
      default:         return null;
    }
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#0e0e0e', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden', paddingBottom: 80 }}>
        {renderView()}
      </div>
      <FloatingNav active={view} onNav={setView} counts={counts} />
      {showOnboard && (
        <Onboarding
          onDone={() => { sessionStorage.setItem(ONBOARDING_KEY, 'true'); setShowOnboard(false); }}
          onGoSettings={() => { sessionStorage.setItem(ONBOARDING_KEY, 'true'); setShowOnboard(false); setView('settings'); }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MesaApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
