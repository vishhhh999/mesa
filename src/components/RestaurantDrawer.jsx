import React from 'react';
import StatusTag from './StatusTag';
import PipelineTrack from './PipelineTrack';

export default function RestaurantDrawer({ restaurant: r, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100 }} />
      <div style={s.drawer}>
        <style>{`@keyframes slideIn { from { transform: translateX(32px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.name}>{r.name}</div>
            <div style={s.meta}>{r.cuisine} · {r.area}</div>
          </div>
          <button onClick={onClose} style={s.closeBtn}>
            <i className="ti ti-x" style={{ fontSize: 14 }} />
          </button>
        </div>

        {/* Content */}
        <div style={s.content}>

          {/* Status row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <StatusTag status={r.status} />
            <PipelineTrack status={r.status} />
          </div>

          {/* Stats grid */}
          <div style={s.statsGrid}>
            {[
              { label: 'Rating',      value: `${r.rating} / 5` },
              { label: 'Reviews',     value: r.reviewCount?.toLocaleString() || '—' },
              { label: 'Photo score', value: `${r.photoScore} / 100` },
              { label: 'Website',     value: r.website ? 'Yes' : 'None found' },
            ].map(st => (
              <div key={st.label} style={s.statBox}>
                <div style={s.statLabel}>{st.label}</div>
                <div style={s.statVal}>{st.value}</div>
              </div>
            ))}
          </div>

          {/* Address */}
          <Section label="Address">
            <div style={s.bodyText}>{r.address || '—'}</div>
            {r.phone && <div style={s.mutedText}>{r.phone}</div>}
          </Section>

          {/* Links */}
          {(r.website || r.gmb) && (
            <Section label="Links">
              {r.website && (
                <a href={r.website} target="_blank" rel="noopener noreferrer" style={s.link}>
                  <i className="ti ti-world" style={{ fontSize: 13 }} />
                  {r.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {r.gmb && (
                <a href={r.gmb} target="_blank" rel="noopener noreferrer" style={s.link}>
                  <i className="ti ti-map-pin" style={{ fontSize: 13 }} />
                  Google Maps listing
                </a>
              )}
            </Section>
          )}

          {/* Audit */}
          {r.audit && (
            <Section label="Brand Audit">
              <AuditItem label="Brand assessment"  text={r.audit.brandAssessment} />
              <AuditItem label="Rebrand direction" text={r.audit.rebrandDirection} />
              <AuditItem label="Pitch angle"       text={r.audit.pitchAngle} accent />
            </Section>
          )}

          {/* Notes */}
          {r.notes && (
            <Section label="Notes">
              <div style={{ ...s.bodyText, fontStyle: 'italic', color: '#9a9489' }}>{r.notes}</div>
            </Section>
          )}

          {r.scrapedAt && (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#3d3d3d', marginTop: 8 }}>
              Scraped {new Date(r.scrapedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c5751', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function AuditItem({ label, text, accent }) {
  return (
    <div style={{ background: accent ? '#1a1710' : '#0e0e0e', border: `1px solid ${accent ? '#2e2616' : '#2a2a2a'}`, borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent ? '#c8b99a' : '#5c5751', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#f0ece4', lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

const s = {
  drawer: { position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, background: '#151515', borderLeft: '1px solid #2a2a2a', zIndex: 101, display: 'flex', flexDirection: 'column', animation: 'slideIn 0.2s ease', boxShadow: '-20px 0 60px rgba(0,0,0,0.4)' },
  header: { padding: '20px 22px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 },
  name:   { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 500, color: '#f0ece4', letterSpacing: '-0.01em' },
  meta:   { fontSize: 11, color: '#5c5751', marginTop: 3, fontFamily: "'DM Sans', sans-serif" },
  closeBtn: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#9a9489', display: 'flex', alignItems: 'center' },
  content: { flex: 1, overflowY: 'auto', padding: 22 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 },
  statBox:   { background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 12px' },
  statLabel: { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c5751', marginBottom: 4 },
  statVal:   { fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#f0ece4', fontWeight: 500 },
  bodyText:  { fontSize: 13, color: '#f0ece4', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" },
  mutedText: { fontSize: 11, color: '#9a9489', marginTop: 2, fontFamily: "'DM Sans', sans-serif" },
  link:      { fontSize: 13, color: '#c8b99a', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" },
};
