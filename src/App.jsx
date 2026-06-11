import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ProspectsView from './components/ProspectsView';
import { AuditQueueView, DecksView, SentView, SettingsView } from './components/OtherViews';
import { KeysProvider, useKeys } from './context/KeysContext';
import { scrapeRestaurants } from './utils/scraper';
import Onboarding from './components/Onboarding';

const RESTAURANTS_KEY = 'mesa_restaurants';
const ONBOARDING_KEY = 'mesa_onboarding_done';

function MesaApp() {
  const { keys } = useKeys();
  const [view, setView] = useState('prospects');
  const [scraping, setScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [scrapeError, setScrapeError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [restaurants, setRestaurantsRaw] = useState(() => {
    try {
      const stored = localStorage.getItem(RESTAURANTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShowOnboarding(true);
  }, []);

  const setRestaurants = (data) => {
    const resolved = typeof data === 'function' ? data(restaurants) : data;
    setRestaurantsRaw(resolved);
    localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(resolved));
  };

  const toggleSelect = (id) => {
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const selectAll = () => setRestaurants(prev => prev.map(r => ({ ...r, selected: true })));
  const deselectAll = () => setRestaurants(prev => prev.map(r => ({ ...r, selected: false })));

  const handleRunAudit = (selected) => {
    alert(`Sending ${selected.length} restaurant(s) to audit queue.\n\nComing in Step 3 — Claude API integration.`);
    setView('audit');
  };

  const handleScrape = async () => {
    if (!keys.apifyToken) {
      setScrapeError('Add your Apify token in Settings first.');
      return;
    }
    setScraping(true);
    setScrapeError(null);
    setScrapeStatus('Starting...');
    try {
      const results = await scrapeRestaurants(
        keys.apifyToken,
        keys.city || 'New Delhi',
        (msg) => setScrapeStatus(msg)
      );
      setRestaurants(results);
      setScrapeStatus('');
    } catch (err) {
      setScrapeError(err.message);
      setScrapeStatus('');
    } finally {
      setScraping(false);
    }
  };

  const handleOnboardingDone = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const counts = {
    total: restaurants.length,
    audit: restaurants.filter(r => r.selected && r.status === 'new').length,
    decks: restaurants.filter(r => r.status === 'mocked').length,
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
        />
      );
      case 'audit': return <AuditQueueView restaurants={restaurants} />;
      case 'decks': return <DecksView />;
      case 'sent': return <SentView restaurants={restaurants} />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  return (
    <div style={styles.app}>
      <Sidebar activeView={view} onNav={setView} counts={counts} />
      <main style={styles.main}>
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
      <MesaApp />
    </KeysProvider>
  );
}

const styles = {
  app: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#F7F6F3', position: 'relative' },
  main: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
};
