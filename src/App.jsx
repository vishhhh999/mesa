import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ProspectsView from './components/ProspectsView';
import { AuditQueueView, DecksView, SentView, SettingsView } from './components/OtherViews';
import { KeysProvider, useKeys } from './context/KeysContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { scrapeRestaurants } from './utils/scraper';
import { auditBatch } from './utils/audit';
import Onboarding from './components/Onboarding';

const ONBOARDING_KEY = 'mesa_onboarding_done';

function MesaApp() {
  const { keys, restaurantStorageKey, searchLocation, locationLabel } = useKeys();
  const { theme } = useTheme();
  const [view, setView] = useState('prospects');
  const [scraping, setScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [scrapeError, setScrapeError] = useState(null);
  const [auditing, setAuditing] = useState(false);
  const [auditStatus, setAuditStatus] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load restaurants from per-city storage key
  const [restaurants, setRestaurantsRaw] = useState(() => {
    try {
      const key = restaurantStorageKey();
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // When location changes, reload from that city's storage
  useEffect(() => {
    try {
      const key = restaurantStorageKey();
      const stored = localStorage.getItem(key);
      setRestaurantsRaw(stored ? JSON.parse(stored) : []);
    } catch { setRestaurantsRaw([]); }
  }, [keys.city, keys.state, keys.country]);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShowOnboarding(true);
  }, []);

  const setRestaurants = (data) => {
    const resolved = typeof data === 'function' ? data(restaurants) : data;
    setRestaurantsRaw(resolved);
    localStorage.setItem(restaurantStorageKey(), JSON.stringify(resolved));
  };

  const toggleSelect = (id) => setRestaurants(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  const selectAll = () => setRestaurants(prev => prev.map(r => ({ ...r, selected: true })));
  const deselectAll = () => setRestaurants(prev => prev.map(r => ({ ...r, selected: false })));

  const handleScrape = async () => {
    if (!keys.apifyToken) { setScrapeError('Add your Apify token in Settings first.'); return; }
    const loc = searchLocation();
    if (!loc) { setScrapeError('Set a target location in Settings first.'); return; }
    setScraping(true); setScrapeError(null); setScrapeStatus('Starting...');
    try {
      const results = await scrapeRestaurants(keys.apifyToken, loc, (msg) => setScrapeStatus(msg));
      setRestaurants(results);
      setScrapeStatus('');
    } catch (err) {
      setScrapeError(err.message); setScrapeStatus('');
    } finally { setScraping(false); }
  };

  const handleRunAudit = async (selectedRestaurants) => {
    if (!keys.anthropicKey) { alert('Add your Anthropic API key in Settings first.'); return; }
    // Capture IDs and full data before any state mutation
    const toAudit = selectedRestaurants.map(r => ({ ...r }));
    setAuditing(true);
    setAuditStatus(`Starting audit for ${toAudit.length} restaurant${toAudit.length > 1 ? 's' : ''}...`);
    setView('audit');
    // Mark selected as auditing
    setRestaurants(prev => prev.map(r =>
      toAudit.find(s => s.id === r.id) ? { ...r, status: 'auditing' } : r
    ));
    try {
      const results = await auditBatch(toAudit, keys.anthropicKey, (i, total, name) => {
        setAuditStatus(`Auditing ${name}... (${i + 1} of ${total})`);
      });
      setRestaurants(prev => prev.map(r => {
        const result = results.find(res => res.id === r.id);
        if (!result) return r;
        return { ...r, audit: result.audit, status: result.status, selected: false };
      }));
      const failed = results.filter(r => r.error);
      if (failed.length > 0) {
        alert(`${results.length - failed.length} audited successfully. ${failed.length} failed:\n${failed.map(f => `• ${f.error}`).join('\n')}`);
      }
    } catch (err) {
      alert('Audit failed: ' + err.message);
      setRestaurants(prev => prev.map(r =>
        toAudit.find(s => s.id === r.id) ? { ...r, status: 'new' } : r
      ));
    } finally {
      setAuditing(false); setAuditStatus('');
    }
  };

  const handleOnboardingDone = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const counts = {
    total: restaurants.length,
    audit: restaurants.filter(r => r.selected && r.status === 'new').length,
    decks: restaurants.filter(r => r.status === 'mocked' || r.status === 'audited').length,
    sent: restaurants.filter(r => r.status === 'sent' || r.status === 'replied').length,
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
      case 'audit': return <AuditQueueView restaurants={restaurants} auditing={auditing} auditStatus={auditStatus} />;
      case 'decks': return <DecksView restaurants={restaurants} />;
      case 'sent': return <SentView restaurants={restaurants} />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg, position: 'relative' }}>
      <Sidebar activeView={view} onNav={setView} counts={counts} />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderView()}
      </main>
      {showOnboarding && (
        <Onboarding
          onDone={handleOnboardingDone}
          onGoSettings={() => { handleOnboardingDone(); setView('settings'); }}
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
