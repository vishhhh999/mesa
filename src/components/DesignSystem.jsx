import React from 'react';

/* ── Buttons ──────────────────────────────────────────────────── */
export function BtnGold({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 8,
        background: disabled ? '#2e2616' : '#c8b99a',
        color: disabled ? '#6b5f4a' : '#0e0e0e',
        fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform 0.15s, opacity 0.15s',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'scale(1.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 14px', borderRadius: 8,
        background: 'transparent',
        color: disabled ? '#3d3d3d' : '#9a9489',
        fontSize: 12, fontFamily: "'DM Sans', sans-serif",
        border: '1px solid #2a2a2a',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'border-color 0.15s, color 0.15s',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#f0ece4'; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = disabled ? '#3d3d3d' : '#9a9489'; }}
    >
      {children}
    </button>
  );
}

/* ── Mono label ───────────────────────────────────────────────── */
export function MonoLabel({ children, accent, style }) {
  return (
    <div style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 9, letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: accent ? '#c8b99a' : '#5c5751',
      marginBottom: 6,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Status tag ───────────────────────────────────────────────── */
const STATUS_COLORS = {
  new:      '#5c5751',
  auditing: '#f2994a',
  audited:  '#c8b99a',
  mocked:   '#6fcf97',
  sent:     '#9a9489',
  replied:  '#c8b99a',
};
const STATUS_LABELS = {
  new: 'New', auditing: 'Auditing', audited: 'Audited',
  mocked: 'Mock ready', sent: 'Sent', replied: 'Replied',
};
export function StatusTag({ status }) {
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace", fontSize: 9,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      color: STATUS_COLORS[status] || '#5c5751',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* ── Pipeline track ───────────────────────────────────────────── */
const SEGS = { new: 0, auditing: 1, audited: 2, mocked: 4, sent: 5, replied: 5 };
export function PipelineTrack({ status }) {
  const filled = SEGS[status] || 0;
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          height: 2, width: 14, borderRadius: 1,
          background: i < filled ? '#c8b99a' : '#2a2a2a',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

/* ── Empty state with custom SVG illustration ─────────────────── */
export function EmptyState({ title, desc, action }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, textAlign: 'center' }} className="fade-in">
      {/* Custom SVG: abstract restaurant mark */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 24, opacity: 0.18 }}>
        {/* Fork */}
        <line x1="20" y1="10" x2="20" y2="54" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="10" x2="16" y2="26" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"/>
        <line x1="24" y1="10" x2="24" y2="26" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 26 Q20 32 24 26" stroke="#c8b99a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Knife */}
        <line x1="44" y1="10" x2="44" y2="54" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M44 10 Q52 18 44 30" stroke="#c8b99a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Plate circle */}
        <circle cx="32" cy="38" r="10" stroke="#c8b99a" strokeWidth="1" opacity="0.4"/>
        <circle cx="32" cy="38" r="6"  stroke="#c8b99a" strokeWidth="0.5" opacity="0.25"/>
      </svg>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 500, color: '#f0ece4', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#5c5751', maxWidth: 300, lineHeight: 1.7 }}>{desc}</div>
      {action && <div style={{ marginTop: 24 }}>{action}</div>}
    </div>
  );
}

/* ── Audit block ──────────────────────────────────────────────── */
export function AuditBlock({ label, text, accent }) {
  return (
    <div style={{
      background: accent ? '#1a1710' : '#0e0e0e',
      border: `1px solid ${accent ? '#2e2616' : '#2a2a2a'}`,
      borderRadius: 8, padding: '12px 14px',
    }}>
      <MonoLabel accent={accent}>{label}</MonoLabel>
      <div style={{ fontSize: 13, color: '#f0ece4', lineHeight: 1.65 }}>{text}</div>
    </div>
  );
}

/* ── Input ────────────────────────────────────────────────────── */
export function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      style={{
        width: '100%', padding: '9px 12px',
        background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6,
        color: '#f0ece4', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        outline: 'none', transition: 'border-color 0.15s',
      }}
      onFocus={e => { e.target.style.borderColor = '#c8b99a'; }}
      onBlur={e => { e.target.style.borderColor = '#2a2a2a'; }}
    />
  );
}

/* ── Select ───────────────────────────────────────────────────── */
export function Select({ value, onChange, options, placeholder, disabled }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%', padding: '9px 12px',
        background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6,
        color: value ? '#f0ece4' : '#5c5751', fontSize: 13,
        fontFamily: "'DM Sans', sans-serif", outline: 'none',
        opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
