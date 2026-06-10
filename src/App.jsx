import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ProspectsView from './components/ProspectsView';
import { AuditQueueView, DecksView, SentView, SettingsView } from './components/OtherViews';
import { KeysProvider, useKeys } from './context/KeysContext';
import { MOCK_RESTAURANTS } from './data/restaurants';
import { scrapeRestaurants } from './utils/scraper';

function MesaApp() {
  const { keys } = useKeys();
  const [view, setView] = useState('prospects');
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS);
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState(null);

  const toggleSelect = (id) => {
    setRestaurants(prev =>
      prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r)
    );
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
    try {
      const results = await scrapeRestaurants(keys.apifyToken, keys.city || 'New Delhi');
      setRestaurants(results);
    } catch (err) {
      setScrapeError(err.message);
    } finally {
      setScraping(false);
    }
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
          scrapeError={scrapeError}
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
  app: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: '#F7F6F3',
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};
