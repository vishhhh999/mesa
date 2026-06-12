import React from 'react';
import { useTheme } from '../context/ThemeContext';
import StatusTag from './StatusTag';
import PipelineTrack from './PipelineTrack';

export default function RestaurantDrawer({ restaurant, onClose }) {
  const { theme } = useTheme();
  if (!restaurant) return null;

  const r = restaurant;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: theme.overlay,
          zIndex: 100,
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 400, background: theme.surface,
        borderLeft: `0.5px solid ${theme.border}`,
        zIndex: 101, display: 'flex', flexDirection: 'column',
        boxShadow: '-16px 0 48px rgba(0,0,0,0.08)',
        animation: 'slideIn 0.2s ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: `0.5px solid ${theme.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 300, color: theme.ink, letterSpacing: '-0.3px' }}>{r.name}</div>
            <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 3 }}>{r.cuisine} · {r.area}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: `0.5px solid ${theme.border}`, borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: theme.inkMuted, display: 'flex', alignItems: 'center' }}>
            <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Status + pipeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StatusTag status={r.status} />
              <PipelineTrack status={r.status} />
            </div>
          </div>

          {/* Core stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Rating', value: `${r.rating} / 5` },
              { label: 'Reviews', value: r.reviewCount?.toLocaleString() || '—' },
              { label: 'Photo score', value: `${r.photoScore} / 100` },
              { label: 'Website', value: r.website ? 'Yes' : 'None found' },
            ].map(stat => (
              <div key={stat.label} style={{ background: theme.surfaceAlt, border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase', color: theme.inkMuted, marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: theme.ink, fontWeight: 500 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Address */}
          <DrawerSection theme={theme} label="Address">
            <div style={{ fontSize: 13, color: theme.ink, lineHeight: 1.6 }}>{r.address || '—'}</div>
            {r.phone && <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 4 }}>{r.phone}</div>}
          </DrawerSection>

          {/* Links */}
          {(r.website || r.gmb) && (
            <DrawerSection theme={theme} label="Links">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {r.website && (
                  <a href={r.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: theme.accent, display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                    <i className="ti ti-world" style={{ fontSize: 13 }} />
                    {r.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {r.gmb && (
                  <a href={r.gmb} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: theme.accent, display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                    <i className="ti ti-map-pin" style={{ fontSize: 13 }} />
                    Google Maps listing
                  </a>
                )}
              </div>
            </DrawerSection>
          )}

          {/* Audit results */}
          {r.audit && (
            <DrawerSection theme={theme} label="Brand Audit">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AuditBlock label="Brand assessment" text={r.audit.brandAssessment} theme={theme} />
                <AuditBlock label="Rebrand direction" text={r.audit.rebrandDirection} theme={theme} />
                <AuditBlock label="Pitch angle" text={r.audit.pitchAngle} theme={theme} accent />
              </div>
            </DrawerSection>
          )}

          {/* Notes */}
          {r.notes && (
            <DrawerSection theme={theme} label="Notes">
              <div style={{ fontSize: 13, color: theme.inkMuted, lineHeight: 1.6, fontStyle: 'italic' }}>{r.notes}</div>
            </DrawerSection>
          )}

          {/* Scraped at */}
          {r.scrapedAt && (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: theme.inkFaint }}>
              Scraped {new Date(r.scrapedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DrawerSection({ theme, label, children }) {
  return (
    <div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: theme.inkMuted, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function AuditBlock({ label, text, theme, accent }) {
  return (
    <div style={{ background: accent ? theme.accentLight : theme.surfaceAlt, border: `0.5px solid ${accent ? theme.accentMid : theme.border}`, borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase', color: accent ? theme.accent : theme.inkMuted, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13, color: theme.ink, lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}
