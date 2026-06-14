import React, { useState, useEffect } from 'react';
import FloatingNav from './components/FloatingNav';
import ProspectsView from './components/ProspectsView';
import { AuditQueueView, DecksView, SentView, SettingsView } from './components/OtherViews';
import { KeysProvider, useKeys } from './context/KeysContext';
import { ThemeProvider } from './context/ThemeContext';
import { scrapeRestaurants } from './utils/scraper';
import { auditBatch } from './utils/audit';
import Onboarding from './components/Onboarding';

const ONBOARDING_KEY = 'mesa_onboarding_done';

function MesaApp() {
  const { keys, restaurantStorageKey, searchLocation, locationLabel } = useKeys();
  const [view,         setView]        = useState('prospects');
  const [scraping,     setScraping]    = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [scrapeError,  setScrapeError]  = useState(null);
  const [auditing,     setAuditing]    = useState(false);
  const [auditStatus,  setAuditStatus]  = useState('');
  const [showOnboard,  setShowOnboard]  = useState(false);

  const [restaurants, setRestaurantsRaw] = useState(() => {
    try {
      const stored = localStorage.getItem(restaurantStorageKey());
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(restaurantStorageKey());
      setRestaurantsRaw(stored ? JSON.parse(stored) : []);
    } catch { setRestaurantsRaw([]); }
  }, [keys.city, keys.state, keys.country]);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) setShowOnboard(true);
  }, []);

  const setRestaurants = (data) => {
    const resolved = typeof data === 'function' ? data(restaurants) : data;
    setRestaurantsRaw(resolved);
    localStorage.setItem(restaurantStorageKey(), JSON.stringify(resolved));
  };

  const toggleSelect    = id      => setRestaurants(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  const selectAll       = ()      => setRestaurants(prev => prev.map(r => ({ ...r, selected: true })));
  const deselectAll     = ()      => setRestaurants(prev => prev.map(r => ({ ...r, selected: false })));
  const updateRestaurant = (id, u) => setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...u } : r));

  const handleScrape = async () => {
    if (!keys.apifyToken) { setScrapeError('Add your Apify token in Settings first.'); return; }
    const loc = searchLocation();
    if (!loc) { setScrapeError('Set a target location in Settings first.'); return; }
    setScraping(true); setScrapeError(null); setScrapeStatus('Starting...');
    try {
      const results = await scrapeRestaurants(keys.apifyToken, loc, msg => setScrapeStatus(msg));
      setRestaurants(results); setScrapeStatus('');
    } catch (err) { setScrapeError(err.message); setScrapeStatus(''); }
    finally { setScraping(false); }
  };

  const handleRunAudit = async (selectedRestaurants) => {
    if (!keys.anthropicKey) { alert('Add your Anthropic API key in Settings first.'); return; }
    const toAudit = selectedRestaurants.map(r => ({ ...r }));
    setAuditing(true);
    setAuditStatus(`Starting audit for ${toAudit.length} restaurant${toAudit.length > 1 ? 's' : ''}...`);
    setView('audit');
    setRestaurants(prev => prev.map(r => toAudit.find(s => s.id === r.id) ? { ...r, status: 'auditing' } : r));
    try {
      const results = await auditBatch(toAudit, keys.anthropicKey, (i, total, name) => {
        setAuditStatus(`Auditing ${name}... (${i + 1} of ${total})`);
      });
      setRestaurants(prev => prev.map(r => {
        const res = results.find(x => x.id === r.id);
        if (!res) return r;
        return { ...r, audit: res.audit, status: res.status, selected: false };
      }));
      const failed = results.filter(r => r.error);
      if (failed.length) alert(`${results.length - failed.length} audited. ${failed.length} failed:\n${failed.map(f => `• ${f.error}`).join('\n')}`);
    } catch (err) {
      alert('Audit failed: ' + err.message);
      setRestaurants(prev => prev.map(r => toAudit.find(s => s.id === r.id) ? { ...r, status: 'new' } : r));
    } finally { setAuditing(false); setAuditStatus(''); }
  };

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
        />
      );
      case 'audit':    return <AuditQueueView restaurants={restaurants} auditing={auditing} auditStatus={auditStatus} />;
      case 'decks':    return <DecksView restaurants={restaurants} onUpdateRestaurant={updateRestaurant} />;
      case 'sent':     return <SentView restaurants={restaurants} />;
      case 'settings': return <SettingsView />;
      default:         return null;
    }
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: '#0e0e0e', display: 'flex', flexDirection: 'column' }}>
      {/* Main content - padded bottom so floating nav doesn't overlap */}
      <div style={{ flex: 1, overflow: 'hidden', paddingBottom: 80 }}>
        {renderView()}
      </div>

      {/* Floating bottom nav */}
      <FloatingNav active={view} onNav={setView} counts={counts} />

      {showOnboard && (
        <Onboarding
          onDone={() => { localStorage.setItem(ONBOARDING_KEY, 'true'); setShowOnboard(false); }}
          onGoSettings={() => { localStorage.setItem(ONBOARDING_KEY, 'true'); setShowOnboard(false); setView('settings'); }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <KeysProvider>
      <ThemeProvider>
        <MesaApp />
      </ThemeProvider>
    </KeysProvider>
  );
}
