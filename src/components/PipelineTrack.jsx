import React from 'react';
import { STATUS_META } from '../data/restaurants';
import { useTheme } from '../context/ThemeContext';

export default function PipelineTrack({ status }) {
  const { theme } = useTheme();
  const meta = STATUS_META[status] || STATUS_META.new;
  const filled = meta.segs;
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ height: 3, width: 18, borderRadius: 2, background: i < filled ? theme.accent : theme.scoreBarBg, transition: 'background 0.2s' }} />
      ))}
    </div>
  );
}
