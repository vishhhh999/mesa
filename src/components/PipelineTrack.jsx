import React from 'react';
import { STATUS_META } from '../data/restaurants';

const TOTAL_SEGS = 5;

export default function PipelineTrack({ status }) {
  const meta = STATUS_META[status] || STATUS_META.new;
  const filled = meta.segs;

  return (
    <div style={styles.track}>
      {Array.from({ length: TOTAL_SEGS }).map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.seg,
            background: i < filled ? '#C8522A' : '#EDE9E3',
            opacity: i < filled ? 1 : 1,
          }}
        />
      ))}
    </div>
  );
}

const styles = {
  track: {
    display: 'flex',
    gap: 3,
    alignItems: 'center',
  },
  seg: {
    height: 3,
    width: 18,
    borderRadius: 2,
    transition: 'background 0.2s',
  },
};
