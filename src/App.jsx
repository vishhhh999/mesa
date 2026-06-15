import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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

function MesaApp() {
  const {
    userId, settings, loading,
    locationLabel, searchLocation,
    industry, anthropicKey, openaiKey, apifyToken,
  } = useAuth();

  // Compute dataKey as a stable value, not a function call
  // This is the critical fix — it's memoized and only changes when settings change
  const dataKey = useMemo(() => {
    if (!settings) return null;
    const loc = [settings.city, settings.state, settings.country]
      .filter(Boolean).join('_').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const ind = settings.industry || 'restaurants';
    if (!loc) return null; // no location set — don't save/load
    return `${loc}__${ind}`;
  }, [settings?.city, settings?.state, settings?.country, settings?.industry]);

  const [view,         setView]          = useState('prospects');
  const [restaurants,  setRestaurantsRaw] = useState([]);
  const [restLoading,  setRestLoading]   = useState(false);
  const [scraping,     setScraping]      = useState(false);
  const [scrapeStatus, setScrapeStatus]  = useState('');
  const [scrapeError,  setScrapeError]   = useState(null);
  const [auditing,     setAuditing]      = useState(false);
  const [auditStatus,  setAuditStatus]   = useState('');
  const [showOnboard,  setShowOnboard]   = useState(false);

  // Stable refs for save — avoids stale closure issues entirely
  const userIdRef  = useRef(userId);
  const dataKeyRef = useRef(dataKey);
  useEffect(() => { userIdRef.current  = userId;  }, [userId]);
  useEffect(() => { dataKeyRef.current = dataKey; }, [dataKey]);

  const saveTimer = useRef(null);

  const saveToSupabase = useCallback((restaurants) => {
    const uid = userIdRef.current;
    const key = dataKeyRef.current;
    if (!uid || !key) return; // not ready
    if (!restaurants || restaurants.length === 0) return; // never save empty

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      // Strip UI-only fields
      const toPersist = restaurants.map(r => {
        const { selected, ...rest } = r;
        return rest;
      });
      saveRestaurants(uid, key, toPersist)
        .then(() => console.log(`[MESA] Saved ${toPersist.length} restaurants to key: ${key}`))
        .catch(err => console.error('[MESA] Save failed:', err));
    }, 600);
  }, []); // no deps — uses refs

  // setRestaurants: updates state AND queues a Supabase save
  const setRestaurants = useCallback((updater) => {
    setRestaurantsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next && next.length > 0) saveToSupabase(next);
      return next;
    });
  }, [saveToSupabase]);

  // Load from Supabase when dataKey changes (location or industry switched)
  useEffect(() => {
    if (!userId || !dataKey) {
      setRestaurantsRaw([]);
      return;
    }
    setRestLoading(true);
    console.log(`[MESA] Loading restaurants for key: ${dataKey}`);
    loadRestaurants(userId, dataKey)
      .then(data => {
        console.log(`[MESA] Loaded ${Array.isArray(data) ? data.length : 0} restaurants`);
        const withUI = (Array.isArray(data) ? data : []).map(r => ({ ...r, selected: false }));
        setRestaurantsRaw(withUI); // don't trigger save on load
      })
      .catch(err => {
        console.error('[MESA] Load failed:', err);
        setRestaurantsRaw([]);
      })
      .finally(() => setRestLoading(false));
  }, [userId, dataKey]);

  useEffect(() => {
    if (userId && !sessionStorage.getItem(ONBOARDING_KEY)) setShowOnboard(true);
  }, [userId]);

  // UI-only — never saves to Supabase
  const toggleSelect = id =>
    setRestaurantsRaw(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  const selectAll   = () =>
    setRestaurantsRaw(prev => prev.map(r => ({ ...r, selected: true })));
  const deselectAll = () =>
    setRestaurantsRaw(prev => prev.map(r => ({ ...r, selected: false })));

  // Persisted — saves to Supabase
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
    } catch (err) {
      setScrapeError(err.message); setScrapeStatus('');
    } finally { setScraping(false); }
  };

  const handleRunAudit = async (selectedRestaurants) => {
    if (!anthropicKey) { alert('Anthropic API key missing — check Settings.'); return; }
    const toAudit = selectedRestaurants.map(r => ({ ...r }));
    setAuditing(true);
    setAuditStatus(`Starting audit for ${toAudit.length} restaurant${toAudit.length > 1 ? 's' : ''}...`);
    setView('audit');

    // Transient UI state — don't persist 'auditing' status
    setRestaurantsRaw(prev => prev.map(r =>
      toAudit.find(s => s.id === r.id) ? { ...r, status: 'auditing' } : r
    ));

    try {
      const { getIndustry } = await import('./data/industries');
      const industryContext = getIndustry(industry).auditContext;
      const results = await auditBatch(toAudit, anthropicKey, (i, total, name) => {
        setAuditStatus(`Auditing ${name}... (${i + 1} of ${total})`);
      }, industryContext);

      // Persist audit results to Supabase
      setRestaurants(prev => prev.map(r => {
        const res = results.find(x => x.id === r.id);
        if (!res) return r;
        return { ...r, audit: res.audit, status: res.status, selected: false };
      }));

      const failed = results.filter(r => r.error);
      if (failed.length) alert(`${results.length - failed.length} audited. ${failed.length} failed:\n${failed.map(f => `• ${f.error}`).join('\n')}`);
    } catch (err) {
      alert('Audit failed: ' + err.message);
      setRestaurantsRaw(prev => prev.map(r =>
        toAudit.find(s => s.id === r.id) ? { ...r, status: 'new' } : r
      ));
    } finally { setAuditing(false); setAuditStatus(''); }
  };

  if (loading) {
    return (
      <div style={{ height:'100vh', background:'#0e0e0e', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="22" stroke="#2a2a2a" strokeWidth="2"/>
          <circle cx="26" cy="26" r="22" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"
            strokeDasharray="36 102" style={{ transformOrigin:'center', animation:'spin 1.2s linear infinite' }}/>
        </svg>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:'#5c5751', letterSpacing:'0.1em', textTransform:'uppercase' }}>
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

  return (
    <div style={{ height:'100vh', overflow:'hidden', background:'#0e0e0e', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, overflow:'hidden', paddingBottom:80 }}>
        {view === 'prospects' && (
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
        )}
        {view === 'audit'    && <AuditQueueView restaurants={restaurants} auditing={auditing} auditStatus={auditStatus} />}
        {view === 'decks'    && <DecksView restaurants={restaurants} onUpdateRestaurant={updateRestaurant} userId={userId} />}
        {view === 'sent'     && <SentView restaurants={restaurants} />}
        {view === 'settings' && <SettingsView />}
      </div>
      <FloatingNav active={view} onNav={setView} counts={counts} />
      {showOnboard && (
        <Onboarding
          onDone={() => { sessionStorage.setItem(ONBOARDING_KEY,'true'); setShowOnboard(false); }}
          onGoSettings={() => { sessionStorage.setItem(ONBOARDING_KEY,'true'); setShowOnboard(false); setView('settings'); }}
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
