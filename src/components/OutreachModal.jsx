import React, { useState } from 'react';
import { BtnGold, BtnGhost, MonoLabel } from './DesignSystem';
import { buildOutreachEmail } from '../utils/email';

export default function OutreachModal({ restaurant, onClose, onApprove, onReject }) {
  const { subject, body, mailto } = buildOutreachEmail(restaurant);
  const [editedSubject, setEditedSubject] = useState(subject);
  const [editedBody,    setEditedBody]    = useState(body);
  const [sent,          setSent]          = useState(false);

  const handleSend = () => {
    const finalMailto = `mailto:?subject=${encodeURIComponent(editedSubject)}&body=${encodeURIComponent(editedBody)}`;
    window.open(finalMailto, '_blank');
    setSent(true);
    setTimeout(() => {
      onApprove(restaurant.id);
      onClose();
    }, 800);
  };

  const handleReject = () => {
    onReject(restaurant.id);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 200 }} className="fade-in" />
      <div style={s.modal} className="scale-in">

        {/* Header */}
        <div style={s.hdr}>
          <div>
            <div style={s.name}>{restaurant.name}</div>
            <div style={s.meta}>{restaurant.cuisine} · {restaurant.area} · Outreach</div>
          </div>
          <button onClick={onClose} style={s.closeBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={s.body}>

          {/* Approve / reject strip */}
          <div style={s.decisionStrip}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#f0ece4', marginBottom: 3 }}>
                Is this a good prospect?
              </div>
              <div style={{ fontSize: 11, color: '#5c5751' }}>
                Approve to send the outreach email. Reject to remove from your pipeline.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.rejectBtn} onClick={handleReject}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                Reject
              </button>
              <button style={s.approveBtn} onClick={() => {}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                Approved
              </button>
            </div>
          </div>

          {/* Pitch angle reminder */}
          {restaurant.audit?.pitchAngle && (
            <div style={s.pitchWrap}>
              <MonoLabel accent>Pitch angle</MonoLabel>
              <div style={{ fontSize: 13, color: '#f0ece4', fontStyle: 'italic', lineHeight: 1.6 }}>
                "{restaurant.audit.pitchAngle}"
              </div>
            </div>
          )}

          {/* Email composer */}
          <div style={s.composerWrap}>
            <MonoLabel>Email draft</MonoLabel>

            <div style={{ marginBottom: 10 }}>
              <label style={s.fieldLabel}>Subject line</label>
              <input
                value={editedSubject}
                onChange={e => setEditedSubject(e.target.value)}
                style={s.subjectInput}
                onFocus={e => { e.target.style.borderColor = '#c8b99a'; }}
                onBlur={e => { e.target.style.borderColor = '#2a2a2a'; }}
              />
            </div>

            <div>
              <label style={s.fieldLabel}>Body</label>
              <textarea
                value={editedBody}
                onChange={e => setEditedBody(e.target.value)}
                style={s.bodyTextarea}
                rows={14}
                onFocus={e => { e.target.style.borderColor = '#c8b99a'; }}
                onBlur={e => { e.target.style.borderColor = '#2a2a2a'; }}
              />
            </div>

            <div style={{ fontSize: 11, color: '#5c5751', marginTop: 8, lineHeight: 1.5 }}>
              Clicking "Open in mail" will open your default mail client with this draft pre-filled.
              Attach the PDF deck before sending.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <BtnGhost onClick={onClose}>Cancel</BtnGhost>
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnGhost onClick={() => navigator.clipboard.writeText(`Subject: ${editedSubject}\n\n${editedBody}`)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy email
            </BtnGhost>
            <BtnGold onClick={handleSend}>
              {sent ? (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg> Opened!</>
              ) : (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Open in mail</>
              )}
            </BtnGold>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  modal:      { position: 'fixed', top: '4vh', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 680, maxHeight: '92vh', background: '#151515', borderRadius: 14, border: '1px solid #2a2a2a', zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' },
  hdr:        { padding: '18px 22px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  name:       { fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 500, color: '#f0ece4' },
  meta:       { fontSize: 11, color: '#5c5751', marginTop: 2 },
  closeBtn:   { background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 6, padding: '7px 8px', cursor: 'pointer', color: '#9a9489', display: 'flex', alignItems: 'center', transition: 'all 0.15s' },
  body:       { flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 16 },
  decisionStrip: { background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 },
  rejectBtn:  { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: '1px solid #3d1515', color: '#eb5757', transition: 'all 0.15s' },
  approveBtn: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, background: '#1a1710', border: '1px solid #c8b99a', color: '#c8b99a' },
  pitchWrap:  { background: '#1a1710', border: '1px solid #2e2616', borderRadius: 8, padding: '12px 16px' },
  composerWrap: { display: 'flex', flexDirection: 'column', gap: 0 },
  fieldLabel: { display: 'block', fontSize: 11, color: '#5c5751', marginBottom: 5, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' },
  subjectInput: { width: '100%', padding: '9px 12px', background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0ece4', fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', marginBottom: 10, transition: 'border-color 0.15s' },
  bodyTextarea: { width: '100%', padding: '10px 12px', background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0ece4', fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'vertical', lineHeight: 1.65, transition: 'border-color 0.15s' },
  footer:     { padding: '14px 22px', borderTop: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
};
