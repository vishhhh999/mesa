import React from 'react';
import { useKeys } from '../context/KeysContext';

const NAV = [
  { id: 'prospects', icon: 'ti-layout-list',      label: 'Prospects',   countKey: 'total' },
  { id: 'audit',     icon: 'ti-wand',              label: 'Audit',       countKey: 'audit' },
  { id: 'decks',     icon: 'ti-file-description',  label: 'Decks',       countKey: 'decks' },
  { id: 'sent',      icon: 'ti-send',              label: 'Sent',        countKey: 'sent'  },
];

export default function Sidebar({ activeView, onNav, counts }) {
  const { locationLabel } = useKeys();

  return (
    <aside style={s.sidebar}>
      {/* Wordmark */}
      <div style={s.wordmark}>
        <span style={s.wordmarkText}>MESA</span>
        <span style={s.wordmarkSub}>Outreach Studio</span>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navGroup}>
          <span style={s.navLabel}>Pipeline</span>
          {NAV.map(item => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
                onClick={() => onNav(item.id)}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 14, flexShrink: 0, opacity: active ? 1 : 0.5 }} />
                <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>
                {counts[item.countKey] > 0 && (
                  <span style={{ ...s.count, ...(active ? s.countActive : {}) }}>
                    {counts[item.countKey]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ ...s.navGroup, marginTop: 24 }}>
          <span style={s.navLabel}>Configure</span>
          <button
            style={{ ...s.navItem, ...(activeView === 'settings' ? s.navItemActive : {}) }}
            onClick={() => onNav('settings')}
          >
            <i className="ti ti-adjustments-horizontal" style={{ fontSize: 14, flexShrink: 0, opacity: activeView === 'settings' ? 1 : 0.5 }} />
            <span style={{ flex: 1, fontSize: 13 }}>Settings</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.locationRow}>
          <span style={s.locationDot} />
          <span style={s.locationText}>{locationLabel()}</span>
        </div>
        <span style={s.version}>v1.0 · beta</span>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: 200,
    minWidth: 200,
    height: '100%',
    background: '#151515',
    borderRight: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
  },
  wordmark: {
    padding: '28px 20px 24px',
    borderBottom: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  wordmarkText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 20,
    fontWeight: 700,
    color: '#f0ece4',
    letterSpacing: '0.12em',
  },
  wordmarkSub: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    color: '#5c5751',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  nav: {
    flex: 1,
    padding: '20px 0',
    overflowY: 'auto',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  navLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    color: '#5c5751',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '0 20px',
    marginBottom: 6,
    display: 'block',
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
    color: '#9a9489',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'color 0.15s, background 0.15s',
  },
  navItemActive: {
    color: '#c8b99a',
    borderLeft: '2px solid #c8b99a',
    background: '#1a1710',
  },
  count: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    background: '#1c1c1c',
    color: '#5c5751',
    padding: '2px 6px',
    borderRadius: 4,
  },
  countActive: {
    background: '#2e2616',
    color: '#c8b99a',
  },
  footer: {
    padding: '14px 20px',
    borderTop: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  locationDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#6fcf97',
    flexShrink: 0,
  },
  locationText: {
    fontSize: 12,
    color: '#9a9489',
    fontFamily: "'DM Sans', sans-serif",
  },
  version: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    color: '#3d3d3d',
    letterSpacing: '0.06em',
  },
};
