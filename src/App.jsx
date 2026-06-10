import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ProspectsView from './components/ProspectsView';
import { AuditQueueView, DecksView, SentView, SettingsView } from './components/OtherViews';
import { MOCK_RESTAURANTS } from './data/restaurants';

export default function App() {
  const [view, setView] = useState('prospects');
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS);

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
