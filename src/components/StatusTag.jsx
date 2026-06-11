import React from 'react';
import { STATUS_META } from '../data/restaurants';

export default function StatusTag({ status }) {
  const meta = STATUS_META[status] || STATUS_META.new;
  return (
    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, padding: '3px 8px', borderRadius: 20, background: meta.bg, color: meta.color, letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>
      {meta.label}
    </span>
  );
}
