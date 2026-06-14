import React from 'react';
import { STATUS_META } from '../data/restaurants';

export default function PipelineTrack({ status }) {
  const meta = STATUS_META[status] || STATUS_META.new;
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          height: 2,
          width: 16,
          borderRadius: 1,
          background: i < meta.segs ? '#c8b99a' : '#2a2a2a',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  );
}
