import React from 'react';
import { STATUS_META } from '../data/restaurants';

// Status as minimal mono label, not a pill badge
export default function StatusTag({ status }) {
  const meta = STATUS_META[status] || STATUS_META.new;
  const colors = {
    new:      { color: '#5c5751' },
    auditing: { color: '#f2994a' },
    audited:  { color: '#c8b99a' },
    mocked:   { color: '#6fcf97' },
    sent:     { color: '#9a9489' },
    replied:  { color: '#c8b99a' },
  };
  const c = colors[status] || colors.new;
  return (
    <span style={{
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      color: c.color,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}>
      {meta.label}
    </span>
  );
}
