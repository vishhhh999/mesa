import React from 'react';
import { StatusTag, PipelineTrack, AuditBlock, MonoLabel, BtnGhost } from './DesignSystem';

export default function RestaurantDrawer({ restaurant: r, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100 }} className="fade-in" />
      <div style={s.drawer} className="slide-right">
        {/* Header */}
        <div style={s.hdr}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.name}>{r.name}</div>
            <div style={s.meta}>{r.cuisine} · {r.area}</div>
          </div>
          <button
            onClick={onClose}
            style={s.closeBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#f0ece4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#9a9489'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content */}
        <div style={s.body}>
          {/* Status + pipeline */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <StatusTag status={r.status} />
            <PipelineTrack status={r.status} />
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Rating',      val: `${r.rating} / 5` },
              { label: 'Reviews',     val: r.reviewCount?.toLocaleString() || '—' },
              { label: 'Photo score', val: `${r.photoScore} / 100` },
              { label: 'Website',     val: r.website ? 'Yes' : 'None found' },
            ].map(st => (
              <div key={st.label} style={s.statBox}>
                <div style={s.statLabel}>{st.label}</div>
                <div style={s.statVal}>{st.val}</div>
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
                <a href={r.website} target="_blank" rel="noopener noreferrer" style={s.link}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  {r.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {r.gmb && (
                <a href={r.gmb} target="_blank" rel="noopener noreferrer" style={s.link}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Google Maps listing
                </a>
              )}
            </Section>
          )}

          {/* Audit */}
          {r.audit && (
            <Section label="Brand Audit">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AuditBlock label="Brand assessment"  text={r.audit.brandAssessment} />
                <AuditBlock label="Rebrand direction" text={r.audit.rebrandDirection} />
                <AuditBlock label="Pitch angle"       text={r.audit.pitchAngle} accent />
              </div>
            </Section>
          )}

          {r.notes && (
            <Section label="Notes">
              <div style={{ ...s.bodyText, color: '#9a9489', fontStyle: 'italic' }}>{r.notes}</div>
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
      <MonoLabel>{label}</MonoLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

const s = {
  drawer:   { position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, background: '#151515', borderLeft: '1px solid #2a2a2a', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-24px 0 64px rgba(0,0,0,0.5)' },
  hdr:      { padding: '20px 22px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0 },
  name:     { fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 500, color: '#f0ece4' },
  meta:     { fontSize: 11, color: '#5c5751', marginTop: 3 },
  closeBtn: { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6, padding: '7px 8px', cursor: 'pointer', color: '#9a9489', display: 'flex', alignItems: 'center', transition: 'all 0.15s', flexShrink: 0 },
  body:     { flex: 1, overflowY: 'auto', padding: '20px 22px' },
  statBox:  { background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 12px' },
  statLabel: { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5c5751', marginBottom: 4 },
  statVal:   { fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#f0ece4', fontWeight: 500 },
  bodyText:  { fontSize: 13, color: '#f0ece4', lineHeight: 1.6 },
  mutedText: { fontSize: 11, color: '#9a9489', marginTop: 2 },
  link:      { fontSize: 12, color: '#c8b99a', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s' },
};
