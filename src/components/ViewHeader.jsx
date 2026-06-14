import React, { useEffect, useRef } from 'react';
import { useKeys } from '../context/KeysContext';

export default function ViewHeader({ title, meta, actions, animate }) {
  const lineRef = useRef(null);
  const { locationLabel } = useKeys();

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (lineRef.current) lineRef.current.style.width = '100%';
        });
      });
    }
  }, [title]);

  return (
    <header style={s.header} className={animate ? 'view-enter' : ''}>
      {/* Gold rule — the signature motion element */}
      <div style={s.ruleTrack}>
        <div ref={lineRef} style={s.rule} />
      </div>

      <div style={s.inner}>
        {/* Wordmark + location */}
        <div style={s.left}>
          <div style={s.wordmark}>MESA</div>
          <div style={s.location}>
            <span style={s.locationDot} />
            {locationLabel()}
          </div>
        </div>

        {/* View title + meta */}
        <div style={s.center}>
          <div style={s.viewTitle}>{title}</div>
          {meta && <div style={s.viewMeta}>{meta}</div>}
        </div>

        {/* Actions slot */}
        <div style={s.actions}>{actions}</div>
      </div>
    </header>
  );
}

const s = {
  header: {
    background: '#151515',
    borderBottom: '1px solid #2a2a2a',
    flexShrink: 0,
    position: 'relative',
  },
  ruleTrack: {
    height: 1,
    background: '#2a2a2a',
    overflow: 'hidden',
  },
  rule: {
    height: '100%',
    background: 'linear-gradient(90deg, #c8b99a 0%, #6b5f4a 100%)',
    width: '0%',
    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    gap: 24,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flexShrink: 0,
  },
  wordmark: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#f0ece4',
    letterSpacing: '0.14em',
    lineHeight: 1,
  },
  location: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    color: '#5c5751',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  locationDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#6fcf97',
    display: 'inline-block',
    flexShrink: 0,
  },
  center: {
    flex: 1,
    paddingLeft: 24,
    borderLeft: '1px solid #2a2a2a',
  },
  viewTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: '#f0ece4',
    lineHeight: 1,
  },
  viewMeta: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    color: '#5c5751',
    marginTop: 3,
  },
  actions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexShrink: 0,
  },
};
