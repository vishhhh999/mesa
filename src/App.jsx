import React, { useState, useEffect } from 'react';
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
    locationLabel, searchLocation, locationKey,
    anthropicKey, openaiKey, apifyToken,
  } = useAuth();

  const [view,          setView]         = useState('prospects');
  const [restaurants,   setRestaurantsRaw] = useState([]);
  const [restLoading,   setRestLoading]  = useState(false);
  const [scraping,      setScraping]     = useState(false);
  const [scrapeStatus,  setScrapeStatus] = useState('');
  const [scrapeError,   setScrapeError]  = useState(null);
  const [auditing,      setAuditing]     = useState(false);
  const [auditStatus,   setAuditStatus]  = useState('');
  const [showOnboard,   setShowOnboard]  = useState(false);

  // Load restaurants from Supabase when userId or location changes
  useEffect(() => {
    if (!userId) return;
    const loc = locationKey();
    if (!loc || loc === 'default') { setRestaurantsRaw([]); return; }
    setRestLoading(true);
    loadRestaurants(userId, loc)
      .then(data => setRestaurantsRaw(Array.isArray(data) ? data : []))
      .catch(() => setRestaurantsRaw([]))
      .finally(() => setRestLoading(false));
  }, [userId, settings?.city, settings?.state, settings?.country]);

  // Show onboarding for new sessions
  useEffect(() => {
    if (userId && !sessionStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboard(true);
    }
  }, [userId]);

  const setRestaurants = async (data) => {
    const resolved = typeof data === 'function' ? data(restaurants) : data;
    setRestaurantsRaw(resolved);
    if (userId) {
      const loc = locationKey();
      if (loc && loc !== 'default') {
        saveRestaurants(userId, loc, resolved).catch(console.error);
      }
    }
  };

  const toggleSelect    = id      => setRestaurants(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  const selectAll       = ()      => setRestaurants(prev => prev.map(r => ({ ...r, selected: true })));
  const deselectAll     = ()      => setRestaurants(prev => prev.map(r => ({ ...r, selected: false })));
  const updateRestaurant = (id, u) => setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...u } : r));

  const handleScrape = async () => {
    if (!apifyToken)  { setScrapeError('Add your Apify token in Settings first.'); return; }
    const loc = searchLocation();
    if (!loc) { setScrapeError('Set a target location in Settings first.'); return; }
    setScraping(true); setScrapeError(null); setScrapeStatus('Starting...');
    try {
      const results = await scrapeRestaurants(apifyToken, loc, msg => setScrapeStatus(msg));
      await setRestaurants(results);
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
    await setRestaurants(prev => prev.map(r => toAudit.find(s => s.id === r.id) ? { ...r, status: 'auditing' } : r));
    try {
      const results = await auditBatch(toAudit, anthropicKey, (i, total, name) => {
        setAuditStatus(`Auditing ${name}... (${i + 1} of ${total})`);
      });
      await setRestaurants(prev => prev.map(r => {
        const res = results.find(x => x.id === r.id);
        if (!res) return r;
        return { ...r, audit: res.audit, status: res.status, selected: false };
      }));
      const failed = results.filter(r => r.error);
      if (failed.length) alert(`${results.length - failed.length} audited. ${failed.length} failed:\n${failed.map(f => `• ${f.error}`).join('\n')}`);
    } catch (err) {
      alert('Audit failed: ' + err.message);
      await setRestaurants(prev => prev.map(r => toAudit.find(s => s.id === r.id) ? { ...r, status: 'new' } : r));
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
