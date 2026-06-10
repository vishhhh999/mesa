import React, { useState } from 'react';
import PipelineTrack from './PipelineTrack';
import StatusTag from './StatusTag';

export default function ProspectsView({ restaurants, onToggle, onSelectAll, onDeselectAll, onRunAudit }) {
  const [sortBy, setSortBy] = useState('photoScore');
  const [sortDir, setSortDir] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');

  const selected = restaurants.filter(r => r.selected);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  };

  const filtered = restaurants
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      if (sortDir === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <i className="ti ti-selector" style={{ fontSize: 11, marginLeft: 3, opacity: 0.3 }} />;
    return <i className={`ti ti-chevron-${sortDir === 'asc' ? 'up' : 'down'}`} style={{ fontSize: 11, marginLeft: 3, color: '#C8522A' }} />;
  };

  return (
    <div style={styles.wrap}>
      {/* Topbar */}
      <div style={styles.topbar}>
        <div>
          <div style={styles.topTitle}>Prospects</div>
          <div style={styles.topMeta}>New Delhi · {restaurants.length} restaurants scraped</div>
        </div>
        <div style={styles.topActions}>
          <button style={styles.btnGhost} onClick={() => alert('Scraper integration coming in Step 2')}>
            <i className="ti ti-refresh" style={{ fontSize: 13 }} />
            Scrape
          </button>
          <button
            style={{ ...styles.btnPrimary, opacity: selected.length === 0 ? 0.45 : 1 }}
            disabled={selected.length === 0}
            onClick={() => onRunAudit(selected)}
          >
            <i className="ti ti-player-play" style={{ fontSize: 13 }} />
            Run Audit ({selected.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { num: restaurants.length, label: 'Total scraped' },
          { num: selected.length, label: 'Selected' },
          { num: restaurants.filter(r => r.status === 'mocked' || r.status === 'sent').length, label: 'Decks ready' },
          { num: restaurants.filter(r => r.status === 'sent' || r.status === 'replied').length, label: 'Emails sent' },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.statCell, borderRight: i < 3 ? '0.5px solid #E4E1D9' : 'none' }}>
            <div style={styles.statNum}>{s.num}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {['all', 'new', 'audited', 'mocked', 'sent', 'replied'].map(f => (
          <button
            key={f}
            style={{ ...styles.filterTab, ...(filterStatus === f ? styles.filterTabActive : {}) }}
            onClick={() => setFilterStatus(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={styles.filterCount}>
              {f === 'all' ? restaurants.length : restaurants.filter(r => r.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: 40 }}>
                <div
                  style={{ ...styles.checkBox, ...(selected.length === filtered.length && filtered.length > 0 ? styles.checkBoxChecked : {}) }}
                  onClick={() => selected.length === filtered.length ? onDeselectAll() : onSelectAll()}
                />
              </th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => handleSort('name')}>
                Restaurant <SortIcon col="name" />
              </th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => handleSort('rating')}>
                Rating <SortIcon col="rating" />
              </th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => handleSort('photoScore')}>
                Photo score <SortIcon col="photoScore" />
              </th>
              <th style={styles.th}>Pipeline</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={styles.emptyCell}>No restaurants in this filter.</td>
              </tr>
            )}
            {filtered.map(r => (
              <tr
                key={r.id}
                style={{ ...styles.row, ...(r.selected ? styles.rowSelected : {}) }}
                onClick={() => onToggle(r.id)}
              >
                <td style={styles.td}>
                  <div style={{ ...styles.checkBox, ...(r.selected ? styles.checkBoxChecked : {}) }}>
                    {r.selected && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.restName}>{r.name}</div>
                  <div style={styles.restMeta}>{r.cuisine} · {r.area}</div>
                </td>
                <td style={styles.td}>
                  <div style={styles.ratingWrap}>
                    <div style={{
                      ...styles.ratingDot,
                      background: r.rating >= 4.2 ? '#639922' : r.rating >= 3.8 ? '#EF9F27' : '#E24B4A'
                    }} />
                    <span style={styles.ratingNum}>{r.rating}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.scoreNum}>{r.photoScore}<span style={styles.scoreMax}>/100</span></div>
                  <div style={styles.scoreBarBg}>
                    <div style={{
                      ...styles.scoreBarFill,
                      width: `${r.photoScore}%`,
                      background: r.photoScore < 30 ? '#E24B4A' : r.photoScore < 50 ? '#EF9F27' : '#639922',
                    }} />
                  </div>
                </td>
                <td style={styles.td}>
                  <PipelineTrack status={r.status} />
                </td>
                <td style={styles.td}>
                  <StatusTag status={r.status} />
                </td>
                <td style={styles.td} onClick={e => e.stopPropagation()}>
                  <button style={styles.rowAction} title="View details">
                    <i className="ti ti-chevron-right" style={{ fontSize: 14, color: '#8A8680' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <span style={styles.selCount}>
          <span style={{ color: '#C8522A', fontWeight: 500 }}>{selected.length}</span> of {restaurants.length} selected
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{ ...styles.btnGhost, opacity: selected.length === 0 ? 0.4 : 1 }}
            disabled={selected.length === 0}
            onClick={onDeselectAll}
          >
            Deselect all
          </button>
          <button style={styles.btnGhost} onClick={onSelectAll}>Select all</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  topbar: { background: '#fff', borderBottom: '0.5px solid #E4E1D9', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topTitle: { fontSize: 14, fontWeight: 500, color: '#1A1916' },
  topMeta: { fontSize: 12, color: '#8A8680', marginTop: 1 },
  topActions: { display: 'flex', gap: 8, alignItems: 'center' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '0.5px solid #E4E1D9', background: '#fff', flexShrink: 0 },
  statCell: { padding: '14px 24px' },
  statNum: { fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: '#1A1916' },
  statLabel: { fontSize: 11, color: '#8A8680', marginTop: 2 },
  filterRow: { display: 'flex', gap: 0, borderBottom: '0.5px solid #E4E1D9', background: '#fff', paddingLeft: 24, flexShrink: 0 },
  filterTab: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#8A8680', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' },
  filterTabActive: { color: '#C8522A', borderBottom: '2px solid #C8522A' },
  filterCount: { fontFamily: "'DM Mono', monospace", fontSize: 10, background: '#F0EDE8', color: '#8A8680', padding: '1px 5px', borderRadius: 10 },
  tableWrap: { flex: 1, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#8A8680', padding: '10px 14px', textAlign: 'left', background: '#F7F6F3', borderBottom: '0.5px solid #E4E1D9', fontWeight: 400, position: 'sticky', top: 0, zIndex: 1, userSelect: 'none' },
  row: { borderBottom: '0.5px solid #F0EDE8', cursor: 'pointer', transition: 'background 0.1s' },
  rowSelected: { background: '#FDF3EF' },
  td: { padding: '13px 14px', fontSize: 13, color: '#1A1916', verticalAlign: 'middle' },
  checkBox: { width: 16, height: 16, border: '1.5px solid #D4D0C8', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 },
  checkBoxChecked: { background: '#C8522A', border: '1.5px solid #C8522A' },
  restName: { fontWeight: 500, fontSize: 13, color: '#1A1916' },
  restMeta: { fontSize: 11, color: '#8A8680', marginTop: 2 },
  ratingWrap: { display: 'flex', alignItems: 'center', gap: 5 },
  ratingDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  ratingNum: { fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#1A1916' },
  scoreNum: { fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#1A1916' },
  scoreMax: { color: '#B4B0A8', fontSize: 10 },
  scoreBarBg: { height: 3, background: '#EDE9E3', borderRadius: 2, marginTop: 4, width: 56 },
  scoreBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.3s' },
  emptyCell: { textAlign: 'center', color: '#8A8680', fontSize: 13, padding: 48 },
  bottomBar: { background: '#fff', borderTop: '0.5px solid #E4E1D9', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  selCount: { fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#8A8680' },
  btnGhost: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '0.5px solid #E4E1D9', color: '#5F5E5A', transition: 'all 0.15s' },
  btnPrimary: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: '#C8522A', color: '#fff', border: 'none', transition: 'all 0.15s' },
  rowAction: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },
};
