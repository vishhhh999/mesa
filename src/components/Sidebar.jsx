import React from 'react';

const NAV_ITEMS = [
  { id: 'prospects', icon: 'ti-layout-list', label: 'Prospects', countKey: 'total' },
  { id: 'audit',     icon: 'ti-wand',         label: 'Audit Queue', countKey: 'audit' },
  { id: 'decks',     icon: 'ti-file-description', label: 'Decks', countKey: 'decks' },
  { id: 'sent',      icon: 'ti-send',          label: 'Sent', countKey: 'sent' },
];

export default function Sidebar({ activeView, onNav, counts }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoWrap}>
        <div style={styles.logoWord}>MESA</div>
        <div style={styles.logoSub}>Outreach Studio</div>
      </div>

      <nav style={styles.nav}>
        <div style={styles.navLabel}>Pipeline</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            style={{
              ...styles.navItem,
              ...(activeView === item.id ? styles.navItemActive : {})
            }}
            onClick={() => onNav(item.id)}
          >
            <i className={`ti ${item.icon}`} style={styles.navIcon} aria-hidden="true" />
            <span style={styles.navText}>{item.label}</span>
            {counts[item.countKey] !== undefined && (
              <span style={{
                ...styles.navCount,
                ...(activeView === item.id ? styles.navCountActive : {})
              }}>
                {counts[item.countKey]}
              </span>
            )}
          </button>
        ))}

        <div style={{ marginTop: 24 }}>
          <div style={styles.navLabel}>Configure</div>
          <button
            style={{
              ...styles.navItem,
              ...(activeView === 'settings' ? styles.navItemActive : {})
            }}
            onClick={() => onNav('settings')}
          >
            <i className="ti ti-adjustments-horizontal" style={styles.navIcon} aria-hidden="true" />
            <span style={styles.navText}>Settings</span>
          </button>
        </div>
      </nav>

      <div style={styles.footer}>
        <div style={styles.cityBadge}>
          <div style={styles.cityDot} />
          <span style={styles.cityText}>New Delhi, IN</span>
        </div>
        <div style={styles.version}>v0.1 · alpha</div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 210,
    minWidth: 210,
    background: '#FFFFFF',
    borderRight: '0.5px solid #E4E1D9',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  logoWrap: {
    padding: '24px 20px 20px',
    borderBottom: '0.5px solid #E4E1D9',
  },
  logoWord: {
    fontFamily: "'Fraunces', serif",
    fontSize: 24,
    fontWeight: 300,
    color: '#1A1916',
    letterSpacing: '-0.5px',
    fontStyle: 'normal',
  },
  logoSub: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    color: '#8A8680',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginTop: 3,
  },
  nav: {
    flex: 1,
    padding: '20px 0',
    overflowY: 'auto',
  },
  navLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#8A8680',
    padding: '0 20px',
    marginBottom: 6,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 20px',
    background: 'transparent',
    border: 'none',
    borderLeft: '2px solid transparent',
    fontSize: 13,
    color: '#8A8680',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  navItemActive: {
    color: '#C8522A',
    borderLeft: '2px solid #C8522A',
    background: '#FDF3EF',
  },
  navIcon: {
    fontSize: 15,
    flexShrink: 0,
  },
  navText: {
    flex: 1,
  },
  navCount: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    background: '#F0EDE8',
    color: '#8A8680',
    padding: '2px 6px',
    borderRadius: 10,
  },
  navCountActive: {
    background: '#F5D8CC',
    color: '#C8522A',
  },
  footer: {
    padding: '14px 20px',
    borderTop: '0.5px solid #E4E1D9',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  cityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  cityDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#4CAF50',
    flexShrink: 0,
  },
  cityText: {
    fontSize: 12,
    color: '#5F5E5A',
  },
  version: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: '#B4B0A8',
  },
};
