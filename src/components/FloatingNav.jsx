import React, { useState } from 'react';

const ITEMS = [
  { id: 'prospects', label: 'Prospects', path: 'M3 6h18M3 12h18M3 18h18' },
  { id: 'audit',     label: 'Audit',     path: 'M12 3l1.5 4.5H18l-3.75 2.7 1.5 4.5L12 12l-3.75 2.7 1.5-4.5L6 7.5h4.5z' },
  { id: 'decks',     label: 'Decks',     path: 'M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
  { id: 'sent',      label: 'Sent',      path: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' },
  { id: 'settings',  label: 'Settings',  path: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
];

export default function FloatingNav({ active, onNav, counts }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={s.wrap}>
      <div style={s.pill}>
        {ITEMS.map((item, idx) => {
          const isActive = active === item.id;
          const count = counts?.[item.id === 'prospects' ? 'total' : item.id === 'audit' ? 'audit' : item.id === 'decks' ? 'decks' : item.id === 'sent' ? 'sent' : null];
          return (
            <button
              key={item.id}
              style={{
                ...s.item,
                ...(isActive ? s.itemActive : {}),
              }}
              onClick={() => onNav(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              title={item.label}
            >
              {/* SVG icon */}
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none"
                stroke={isActive ? '#c8b99a' : hovered === item.id ? '#f0ece4' : '#5c5751'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'stroke 0.15s', flexShrink: 0 }}
              >
                <path d={item.path} />
              </svg>

              {/* Label - only shown when active */}
              <span style={{
                ...s.label,
                maxWidth: isActive ? 60 : 0,
                opacity: isActive ? 1 : 0,
                marginLeft: isActive ? 6 : 0,
              }}>
                {item.label}
              </span>

              {/* Count badge */}
              {count > 0 && !isActive && (
                <span style={s.badge}>{count > 9 ? '9+' : count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
    pointerEvents: 'none',
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'rgba(21,21,21,0.92)',
    border: '1px solid #2a2a2a',
    borderRadius: 9999,
    padding: '8px 12px',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(200,185,154,0.08)',
    pointerEvents: 'all',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: 9999,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.15s',
    outline: 'none',
  },
  itemActive: {
    background: '#1a1710',
  },
  label: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: '#c8b99a',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'max-width 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s, margin-left 0.25s',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    background: '#c8b99a',
    color: '#0e0e0e',
    fontFamily: "'DM Mono', monospace",
    fontSize: 8,
    fontWeight: 500,
    borderRadius: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
  },
};
