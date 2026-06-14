import React, { useState } from 'react';
import PipelineTrack from './PipelineTrack';
import StatusTag from './StatusTag';
import RestaurantDrawer from './RestaurantDrawer';

export default function ProspectsView({
  restaurants, onToggle, onSelectAll, onDeselectAll,
  onRunAudit, onScrape, scraping, scrapeStatus,
  scrapeError, onGoSettings, locationLabel,
}) {
  const [sortBy, setSortBy]       = useState('photoScore');
  const [sortDir, setSortDir]     = useState('asc');
  const [filterStatus, setFilter] = useState('all');
  const [drawer, setDrawer]       = useState(null);

  const selected = restaurants.filter(r => r.selected);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  };

  const filtered = [...restaurants]
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (sortDir === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });

  const STATUS_FILTERS = ['all','new','auditing','audited','mocked','sent','replied'];

  return (
    <div style={s.wrap}>

      {/* Topbar */}
      <div style={s.topbar}>
        <div>
          <div style={s.topTitle}>Prospects</div>
          <div style={s.topMeta}>
            {scraping
              ? <span style={{ color: '#c8b99a' }}>{scrapeStatus || 'Scraping...'}</span>
              : restaurants.length > 0
                ? `${locationLabel} · ${restaurants.length} restaurants`
                : `${locationLabel || 'No location set'} · No data yet`
            }
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <button style={s.btnGhost} onClick={onScrape} disabled={scraping}>
              <i className={`ti ${scraping ? 'ti-loader-2' : 'ti-refresh'}`} style={{ fontSize: 13 }} />
              {scraping ? 'Scraping...' : 'Scrape'}
            </button>
            {scrapeError && <span style={s.errorText}>{scrapeError}</span>}
          </div>
          <button
            style={{ ...s.btnGold, opacity: selected.length === 0 ? 0.35 : 1 }}
            disabled={selected.length === 0}
            onClick={() => onRunAudit(selected)}
          >
            <i className="ti ti-player-play" style={{ fontSize: 13 }} />
            Run Audit ({selected.length})
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={s.statsStrip}>
        {[
          { num: restaurants.length, label: 'Scraped' },
          { num: selected.length,    label: 'Selected' },
          { num: restaurants.filter(r => ['audited','mocked'].includes(r.status)).length, label: 'Audited' },
          { num: restaurants.filter(r => ['sent','replied'].includes(r.status)).length,   label: 'Sent' },
        ].map((stat, i) => (
          <div key={i} style={{ ...s.statCell, borderRight: i < 3 ? '1px solid #2a2a2a' : 'none' }}>
            <div style={s.statNum}>{stat.num}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div style={s.filterRow}>
        {STATUS_FILTERS.map(f => {
          const active = filterStatus === f;
          const cnt = f === 'all' ? restaurants.length : restaurants.filter(r => r.status === f).length;
          return (
            <button key={f} style={{ ...s.filterTab, ...(active ? s.filterTabActive : {}) }} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              {cnt > 0 && <span style={{ ...s.filterCount, ...(active ? s.filterCountActive : {}) }}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {restaurants.length === 0 && !scraping && (
        <div style={s.empty}>
          <i className="ti ti-map-pin-off" style={{ fontSize: 28, color: '#2a2a2a', marginBottom: 16 }} />
          <div style={s.emptyTitle}>No restaurants yet</div>
          <div style={s.emptyDesc}>
            {locationLabel ? `Hit Scrape to pull restaurants from ${locationLabel}.` : 'Set a target location in Settings, then hit Scrape.'}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button style={s.btnGhost} onClick={onGoSettings}>
              <i className="ti ti-adjustments-horizontal" style={{ fontSize: 13 }} /> Settings
            </button>
            <button style={s.btnGold} onClick={onScrape} disabled={scraping}>
              <i className="ti ti-refresh" style={{ fontSize: 13 }} />
              {scraping ? 'Scraping...' : 'Scrape'}
            </button>
          </div>
          {scrapeError && <div style={{ ...s.errorText, marginTop: 12, textAlign: 'center' }}>{scrapeError}</div>}
        </div>
      )}

      {/* Scraping loading */}
      {scraping && restaurants.length === 0 && (
        <div style={{ ...s.empty, gap: 12 }}>
          <i className="ti ti-loader-2" style={{ fontSize: 28, color: '#c8b99a' }} />
          <div style={s.emptyTitle}>Scraping Google Maps</div>
          <div style={s.emptyDesc}>{scrapeStatus}</div>
        </div>
      )}

      {/* Table */}
      {restaurants.length > 0 && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: 32 }}></th>
                <th style={{ ...s.th, cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Restaurant <SortChevron col="name" sortBy={sortBy} sortDir={sortDir} />
                </th>
                <th style={{ ...s.th, cursor: 'pointer' }} onClick={() => handleSort('rating')}>
                  Rating <SortChevron col="rating" sortBy={sortBy} sortDir={sortDir} />
                </th>
                <th style={{ ...s.th, cursor: 'pointer' }} onClick={() => handleSort('photoScore')}>
                  Photo score <SortChevron col="photoScore" sortBy={sortBy} sortDir={sortDir} />
                </th>
                <th style={s.th}>Pipeline</th>
                <th style={s.th}>Status</th>
                <th style={{ ...s.th, width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={s.emptyCell}>No restaurants match this filter.</td></tr>
              )}
              {filtered.map(r => (
                <tr
                  key={r.id}
                  style={{
                    ...s.row,
                    borderLeft: `2px solid ${r.selected ? '#c8b99a' : 'transparent'}`,
                    background: r.selected ? '#1a1710' : '#151515',
                  }}
                  onClick={() => onToggle(r.id)}
                >
                  {/* Selection indicator */}
                  <td style={s.td}>
                    <div style={{
                      width: 14, height: 14,
                      border: `1px solid ${r.selected ? '#c8b99a' : '#3d3d3d'}`,
                      borderRadius: 3,
                      background: r.selected ? '#c8b99a' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.15s',
                    }}>
                      {r.selected && <i className="ti ti-check" style={{ fontSize: 9, color: '#0e0e0e' }} />}
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={s.restName}>{r.name}</div>
                    <div style={s.restMeta}>{r.cuisine} · {r.area}</div>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 12,
                      color: r.rating >= 4.2 ? '#6fcf97' : r.rating >= 3.8 ? '#f2994a' : '#eb5757',
                    }}>{r.rating}</span>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#f0ece4' }}>
                      {r.photoScore}<span style={{ color: '#5c5751', fontSize: 10 }}>/100</span>
                    </div>
                    <div style={{ height: 2, background: '#2a2a2a', borderRadius: 1, marginTop: 5, width: 52 }}>
                      <div style={{
                        height: '100%', borderRadius: 1,
                        width: `${r.photoScore}%`,
                        background: r.photoScore < 30 ? '#eb5757' : r.photoScore < 50 ? '#f2994a' : '#6fcf97',
                      }} />
                    </div>
                  </td>
                  <td style={s.td}><PipelineTrack status={r.status} /></td>
                  <td style={s.td}><StatusTag status={r.status} /></td>
                  <td style={s.td} onClick={e => { e.stopPropagation(); setDrawer(r); }}>
                    <button style={s.rowArrow}>
                      <i className="ti ti-chevron-right" style={{ fontSize: 13, color: '#5c5751' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom bar */}
      <div style={s.bottomBar}>
        <span style={s.selCount}>
          <span style={{ color: '#c8b99a' }}>{selected.length}</span>
          <span style={{ color: '#5c5751' }}> / {restaurants.length} selected</span>
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.btnGhost, opacity: selected.length === 0 ? 0.35 : 1 }} disabled={selected.length === 0} onClick={onDeselectAll}>
            Deselect all
          </button>
          <button style={s.btnGhost} onClick={onSelectAll}>Select all</button>
        </div>
      </div>

      {drawer && (
        <RestaurantDrawer
          restaurant={restaurants.find(r => r.id === drawer.id) || drawer}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
}

function SortChevron({ col, sortBy, sortDir }) {
  if (sortBy !== col) return <i className="ti ti-selector" style={{ fontSize: 10, marginLeft: 3, opacity: 0.25 }} />;
  return <i className={`ti ti-chevron-${sortDir === 'asc' ? 'up' : 'down'}`} style={{ fontSize: 10, marginLeft: 3, color: '#c8b99a' }} />;
}

function getLastScraped(restaurants) {
  const dates = restaurants.map(r => r.scrapedAt).filter(Boolean);
  if (!dates.length) return '';
  const mins = Math.round((Date.now() - new Date(Math.max(...dates.map(d => new Date(d))))) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

const s = {
  wrap:       { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0e0e0e' },
  topbar:     { background: '#151515', borderBottom: '1px solid #2a2a2a', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topTitle:   { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 500, color: '#f0ece4' },
  topMeta:    { fontSize: 12, color: '#5c5751', marginTop: 2, fontFamily: "'DM Sans', sans-serif" },
  statsStrip: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #2a2a2a', background: '#151515', flexShrink: 0 },
  statCell:   { padding: '14px 24px' },
  statNum:    { fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500, color: '#f0ece4' },
  statLabel:  { fontSize: 11, color: '#5c5751', marginTop: 3, fontFamily: "'DM Sans', sans-serif" },
  filterRow:  { display: 'flex', borderBottom: '1px solid #2a2a2a', background: '#151515', paddingLeft: 24, flexShrink: 0, overflowX: 'auto' },
  filterTab:  { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#5c5751', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s', whiteSpace: 'nowrap' },
  filterTabActive: { color: '#c8b99a', borderBottom: '2px solid #c8b99a' },
  filterCount: { fontFamily: "'DM Mono', monospace", fontSize: 9, background: '#1c1c1c', color: '#5c5751', padding: '2px 5px', borderRadius: 3 },
  filterCountActive: { background: '#2e2616', color: '#c8b99a' },
  tableWrap:  { flex: 1, overflowY: 'auto' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5c5751', padding: '10px 14px', textAlign: 'left', background: '#0e0e0e', borderBottom: '1px solid #2a2a2a', fontWeight: 400, position: 'sticky', top: 0, zIndex: 1, userSelect: 'none' },
  row:        { borderBottom: '1px solid #1f1f1f', cursor: 'pointer', transition: 'background 0.1s, border-left 0.1s' },
  td:         { padding: '14px 14px', fontSize: 13, color: '#f0ece4', verticalAlign: 'middle' },
  restName:   { fontWeight: 500, fontSize: 13, color: '#f0ece4', fontFamily: "'DM Sans', sans-serif" },
  restMeta:   { fontSize: 11, color: '#5c5751', marginTop: 2, fontFamily: "'DM Sans', sans-serif" },
  rowArrow:   { background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'background 0.1s' },
  empty:      { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, textAlign: 'center' },
  emptyTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 500, color: '#f0ece4', marginBottom: 8 },
  emptyDesc:  { fontSize: 13, color: '#5c5751', maxWidth: 320, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" },
  emptyCell:  { textAlign: 'center', color: '#5c5751', fontSize: 13, padding: 64 },
  bottomBar:  { background: '#151515', borderTop: '1px solid #2a2a2a', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  selCount:   { fontFamily: "'DM Mono', monospace", fontSize: 11 },
  errorText:  { fontSize: 11, color: '#eb5757', maxWidth: 260, textAlign: 'right', lineHeight: 1.5 },
  btnGhost:   { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '8px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #2a2a2a', color: '#9a9489', transition: 'all 0.15s' },
  btnGold:    { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '8px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: '#c8b99a', color: '#0e0e0e', border: 'none', fontWeight: 500, transition: 'all 0.15s' },
};
