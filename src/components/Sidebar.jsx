import React from 'react';
import { useKeys } from '../context/KeysContext';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { id: 'prospects',  icon: 'ti-layout-list',          label: 'Prospects',   countKey: 'total' },
  { id: 'audit',      icon: 'ti-wand',                  label: 'Audit Queue', countKey: 'audit' },
  { id: 'decks',      icon: 'ti-file-description',      label: 'Decks',       countKey: 'decks' },
  { id: 'sent',       icon: 'ti-send',                  label: 'Sent',        countKey: 'sent' },
];

export default function Sidebar({ activeView, onNav, counts }) {
  const { locationLabel } = useKeys();
  const { theme, isDark } = useTheme();
  const { keys, saveKeys } = useKeys();

  const toggleTheme = () => saveKeys({ theme: isDark ? 'light' : 'dark' });

  return (
    <aside style={{
      width: 210, minWidth: 210,
      background: theme.surface,
      borderRight: `0.5px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `0.5px solid ${theme.border}` }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 300, color: theme.ink, letterSpacing: '-0.5px' }}>
          MESA
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: theme.inkMuted, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 3 }}>
          Outreach Studio
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
        <div style={labelStyle(theme)}>Pipeline</div>
        {NAV_ITEMS.map(item => {
          const active = activeView === item.id;
          return (
            <button key={item.id} style={navItemStyle(theme, active)} onClick={() => onNav(item.id)}>
              <i className={`ti ${item.icon}`} style={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true" />
              <span style={{ flex: 1 }}>{item.label}</span>
              {counts[item.countKey] !== undefined && (
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10,
                  background: active ? theme.accentMid : theme.filterCountBg,
                  color: active ? theme.accent : theme.inkMuted,
                  padding: '2px 6px', borderRadius: 10,
                }}>
                  {counts[item.countKey]}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ marginTop: 24 }}>
          <div style={labelStyle(theme)}>Configure</div>
          <button style={navItemStyle(theme, activeView === 'settings')} onClick={() => onNav('settings')}>
            <i className="ti ti-adjustments-horizontal" style={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true" />
            <span style={{ flex: 1 }}>Settings</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: `0.5px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: theme.inkMuted }}>{locationLabel()}</span>
          </div>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'transparent', border: `0.5px solid ${theme.border}`,
              borderRadius: 6, padding: '4px 6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: theme.inkMuted,
              fontSize: 13,
            }}
          >
            <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} aria-hidden="true" />
          </button>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: theme.inkFaint }}>
          v0.4 · alpha
        </div>
      </div>
    </aside>
  );
}

function labelStyle(theme) {
  return {
    fontFamily: "'DM Mono', monospace", fontSize: 9,
    letterSpacing: '1.5px', textTransform: 'uppercase',
    color: theme.inkMuted, padding: '0 20px', marginBottom: 6,
  };
}

function navItemStyle(theme, active) {
  return {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '9px 20px',
    background: active ? theme.navActive : 'transparent',
    border: 'none', borderLeft: `2px solid ${active ? theme.accent : 'transparent'}`,
    fontSize: 13, color: active ? theme.accent : theme.inkMuted,
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
    fontFamily: "'DM Sans', sans-serif",
  };
}
