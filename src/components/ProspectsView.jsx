import React, { useState } from 'react';
import { BtnGold, BtnGhost, StatusTag, PipelineTrack, EmptyState, MonoLabel } from './DesignSystem';
import ViewHeader from './ViewHeader';
import RestaurantDrawer from './RestaurantDrawer';

export default function ProspectsView({
  restaurants, onToggle, onSelectAll, onDeselectAll,
  onRunAudit, onScrape, scraping, scrapeStatus,
  scrapeError, onGoSettings, locationLabel,
}) {
  const [viewMode,    setViewMode]  = useState('table'); // 'table' | 'card'
  const [sortBy,      setSortBy]    = useState('photoScore');
  const [sortDir,     setSortDir]   = useState('asc');
  const [filter,      setFilter]    = useState('all');
  const [drawer,      setDrawer]    = useState(null);

  const selected = restaurants.filter(r => r.selected);

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  };

  const filtered = [...restaurants]
    .filter(r => filter === 'all' || r.status === filter)
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const stats = [
    { num: restaurants.length, label: 'Scraped' },
    { num: selected.length,    label: 'Selected' },
    { num: restaurants.filter(r => ['audited','mocked'].includes(r.status)).length, label: 'Audited' },
    { num: restaurants.filter(r => ['sent','replied'].includes(r.status)).length,   label: 'Sent' },
  ];

  const scrapeLabel = scraping
    ? <span style={{ color: '#c8b99a' }}>{scrapeStatus || 'Scraping...'}</span>
    : restaurants.length > 0
      ? `${restaurants.length} restaurants · ${getLastScraped(restaurants)}`
      : 'No data — hit Scrape to begin';

  return (
    <div style={s.wrap}>
      <ViewHeader
        title="Prospects"
        meta={scrapeLabel}
        animate
        actions={
          <>
            <BtnGhost onClick={onScrape} disabled={scraping}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              {scraping ? 'Scraping...' : 'Scrape'}
            </BtnGhost>
            <BtnGold onClick={() => onRunAudit(selected)} disabled={selected.length === 0}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Run Audit ({selected.length})
            </BtnGold>
          </>
        }
      />

      {scrapeError && (
        <div style={{ padding: '10px 32px', background: '#1a0a0a', borderBottom: '1px solid #3d1515', fontSize: 12, color: '#eb5757' }}>
          {scrapeError}
        </div>
      )}

      {/* Stats row */}
      <div style={s.statsRow}>
        {stats.map((st, i) => (
          <div key={i} style={{ ...s.statCell, borderRight: i < 3 ? '1px solid #2a2a2a' : 'none' }}>
            <div style={s.statNum}>{st.num}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + view toggle row */}
      <div style={s.toolbar}>
        <div style={s.filters}>
          {['all','new','auditing','audited','mocked','sent','replied'].map(f => {
            const cnt = f === 'all' ? restaurants.length : restaurants.filter(r => r.status === f).length;
            const active = filter === f;
            return (
              <button key={f} style={{ ...s.filterBtn, ...(active ? s.filterBtnActive : {}) }} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                {cnt > 0 && (
                  <span style={{ ...s.filterCount, ...(active ? s.filterCountActive : {}) }}>{cnt}</span>
                )}
              </button>
            );
          })}
        </div>
        {/* View toggle */}
        <div style={s.viewToggle}>
          {[
            { mode: 'table', path: 'M3 6h18M3 12h18M3 18h18' },
            { mode: 'card',  path: 'M4 6h4v4H4zM10 6h4v4h-4zM16 6h4v4h-4zM4 13h4v4H4zM10 13h4v4h-4zM16 13h4v4h-4z' },
          ].map(({ mode, path }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                ...s.toggleBtn,
                background: viewMode === mode ? '#1a1710' : 'transparent',
                border: `1px solid ${viewMode === mode ? '#c8b99a' : '#2a2a2a'}`,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={viewMode === mode ? '#c8b99a' : '#5c5751'}
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={path} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={s.content}>
        {restaurants.length === 0 && !scraping && (
          <EmptyState
            title="No restaurants yet"
            desc={locationLabel ? `Hit Scrape to pull restaurants from ${locationLabel}.` : 'Set a target location in Settings, then hit Scrape.'}
            action={
              <div style={{ display: 'flex', gap: 10 }}>
                <BtnGhost onClick={onGoSettings}>Settings</BtnGhost>
                <BtnGold onClick={onScrape} disabled={scraping}>Scrape</BtnGold>
              </div>
            }
          />
        )}

        {scraping && restaurants.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }} className="fade-in">
            <div style={{ position: 'relative', width: 48, height: 48 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#2a2a2a" strokeWidth="2"/>
                <circle cx="24" cy="24" r="20" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"
                  strokeDasharray="32 94" style={{ transformOrigin: 'center', animation: 'spin 1.2s linear infinite' }}/>
              </svg>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 500, color: '#f0ece4' }}>Crawling Google Maps</div>
            <div style={{ fontSize: 12, color: '#5c5751' }}>{scrapeStatus}</div>
          </div>
        )}

        {restaurants.length > 0 && viewMode === 'table' && (
          <TableView
            filtered={filtered}
            restaurants={restaurants}
            onToggle={onToggle}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
            selected={selected}
            sortBy={sortBy}
            sortDir={sortDir}
            handleSort={handleSort}
            onOpenDrawer={setDrawer}
          />
        )}

        {restaurants.length > 0 && viewMode === 'card' && (
          <CardView
            filtered={filtered}
            onToggle={onToggle}
            onOpenDrawer={setDrawer}
          />
        )}
      </div>

      {/* Bottom bar */}
      <div style={s.bottomBar}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
          <span style={{ color: '#c8b99a' }}>{selected.length}</span>
          <span style={{ color: '#3d3d3d' }}> / {restaurants.length}</span>
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <BtnGhost onClick={onDeselectAll} disabled={selected.length === 0}>Deselect all</BtnGhost>
          <BtnGhost onClick={onSelectAll}>Select all</BtnGhost>
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

/* ── Table view ───────────────────────────────────────────────── */
function TableView({ filtered, restaurants, onToggle, onSelectAll, onDeselectAll, selected, sortBy, sortDir, handleSort, onOpenDrawer }) {
  const Chevron = ({ col }) => {
    if (sortBy !== col) return <span style={{ opacity: 0.2, fontSize: 10, marginLeft: 3 }}>↕</span>;
    return <span style={{ color: '#c8b99a', fontSize: 10, marginLeft: 3 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const allSel = filtered.length > 0 && filtered.every(r => r.selected);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={s.th}>
              <div
                style={{ ...s.check, ...(allSel ? s.checkActive : {}) }}
                onClick={() => allSel ? onDeselectAll() : onSelectAll()}
              >
                {allSel && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0e0e0e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </th>
            {[['name','Restaurant'],['rating','Rating'],['photoScore','Photo']].map(([key,label]) => (
              <th key={key} style={{ ...s.th, cursor: 'pointer' }} onClick={() => handleSort(key)}>
                {label}<Chevron col={key} />
              </th>
            ))}
            <th style={s.th}>Pipeline</th>
            <th style={s.th}>Status</th>
            <th style={{ ...s.th, width: 40 }} />
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: '#5c5751', padding: 64, fontSize: 13 }}>No restaurants match this filter.</td></tr>
          )}
          {filtered.map((r, i) => (
            <tr
              key={r.id}
              className="stagger-item"
              style={{
                animationDelay: `${Math.min(i, 12) * 40}ms`,
                borderBottom: '1px solid #1f1f1f',
                cursor: 'pointer',
                background: r.selected ? '#1a1710' : '#151515',
                borderLeft: `2px solid ${r.selected ? '#c8b99a' : 'transparent'}`,
                transition: 'background 0.15s, border-left-color 0.15s',
              }}
              onClick={() => onToggle(r.id)}
            >
              <td style={s.td}>
                <div style={{ ...s.check, ...(r.selected ? s.checkActive : {}) }}>
                  {r.selected && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0e0e0e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </td>
              <td style={s.td}>
                <div style={{ fontWeight: 500, fontSize: 13, color: '#f0ece4' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#5c5751', marginTop: 2 }}>{r.cuisine} · {r.area}</div>
              </td>
              <td style={s.td}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: r.rating >= 4.2 ? '#6fcf97' : r.rating >= 3.8 ? '#f2994a' : '#eb5757' }}>
                  {r.rating}
                </span>
              </td>
              <td style={s.td}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#f0ece4' }}>
                  {r.photoScore}<span style={{ color: '#3d3d3d', fontSize: 10 }}>/100</span>
                </div>
                <div style={{ height: 2, background: '#2a2a2a', borderRadius: 1, marginTop: 5, width: 48 }}>
                  <div style={{ height: '100%', borderRadius: 1, width: `${r.photoScore}%`, background: r.photoScore < 30 ? '#eb5757' : r.photoScore < 50 ? '#f2994a' : '#6fcf97', transition: 'width 0.4s' }} />
                </div>
              </td>
              <td style={s.td}><PipelineTrack status={r.status} /></td>
              <td style={s.td}><StatusTag status={r.status} /></td>
              <td style={s.td} onClick={e => { e.stopPropagation(); onOpenDrawer(r); }}>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5c5751" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Card view ────────────────────────────────────────────────── */
function CardView({ filtered, onToggle, onOpenDrawer }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map((r, i) => (
          <div
            key={r.id}
            className="stagger-item hover-lift"
            style={{
              animationDelay: `${Math.min(i, 12) * 50}ms`,
              background: r.selected ? '#1a1710' : '#151515',
              border: `1px solid ${r.selected ? '#c8b99a' : '#2a2a2a'}`,
              borderRadius: 12,
              padding: 20,
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onClick={() => onToggle(r.id)}
          >
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 500, color: '#f0ece4', marginBottom: 3 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#5c5751' }}>{r.cuisine}</div>
              </div>
              {/* Selection indicator */}
              <div style={{
                width: 16, height: 16, borderRadius: 4,
                border: `1px solid ${r.selected ? '#c8b99a' : '#3d3d3d'}`,
                background: r.selected ? '#c8b99a' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}>
                {r.selected && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0e0e0e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ background: '#0e0e0e', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#5c5751', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Rating</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: r.rating >= 4.2 ? '#6fcf97' : r.rating >= 3.8 ? '#f2994a' : '#eb5757' }}>{r.rating}</div>
              </div>
              <div style={{ background: '#0e0e0e', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#5c5751', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Photo</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#f0ece4' }}>{r.photoScore}<span style={{ fontSize: 10, color: '#3d3d3d' }}>/100</span></div>
              </div>
            </div>

            {/* Photo score bar */}
            <div style={{ height: 2, background: '#2a2a2a', borderRadius: 1, marginBottom: 14 }}>
              <div style={{ height: '100%', borderRadius: 1, width: `${r.photoScore}%`, background: r.photoScore < 30 ? '#eb5757' : r.photoScore < 50 ? '#f2994a' : '#6fcf97', transition: 'width 0.5s' }} />
            </div>

            {/* Pipeline + status + detail */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <PipelineTrack status={r.status} />
                <StatusTag status={r.status} />
              </div>
              <button
                style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'border-color 0.15s' }}
                onClick={e => { e.stopPropagation(); onOpenDrawer(r); }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#c8b99a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9a9489" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
                </svg>
              </button>
            </div>

            {/* Audit pitch angle if available */}
            {r.audit?.pitchAngle && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2a2a', fontSize: 11, color: '#9a9489', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{r.audit.pitchAngle}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getLastScraped(restaurants) {
  const dates = restaurants.map(r => r.scrapedAt).filter(Boolean);
  if (!dates.length) return '';
  const mins = Math.round((Date.now() - new Date(Math.max(...dates.map(d => new Date(d))))) / 60000);
  if (mins < 2) return 'scraped just now';
  if (mins < 60) return `scraped ${mins}m ago`;
  return `scraped ${Math.round(mins / 60)}h ago`;
}

const s = {
  wrap:        { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#0e0e0e' },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: '#151515', borderBottom: '1px solid #2a2a2a', flexShrink: 0 },
  statCell:    { padding: '12px 32px' },
  statNum:     { fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: '#f0ece4' },
  statLabel:   { fontSize: 10, color: '#5c5751', marginTop: 2, letterSpacing: '0.06em' },
  toolbar:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid #2a2a2a', background: '#151515', flexShrink: 0 },
  filters:     { display: 'flex', gap: 0, overflowX: 'auto' },
  filterBtn:   { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '10px 12px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#5c5751', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.15s, border-color 0.15s', whiteSpace: 'nowrap' },
  filterBtnActive: { color: '#c8b99a', borderBottom: '2px solid #c8b99a' },
  filterCount: { fontFamily: "'DM Mono', monospace", fontSize: 9, background: '#1c1c1c', color: '#5c5751', padding: '2px 5px', borderRadius: 3 },
  filterCountActive: { background: '#2e2616', color: '#c8b99a' },
  viewToggle:  { display: 'flex', gap: 6, padding: '8px 0' },
  toggleBtn:   { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', background: 'transparent', transition: 'all 0.15s' },
  content:     { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  th:          { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5c5751', padding: '10px 16px', textAlign: 'left', background: '#0e0e0e', borderBottom: '1px solid #2a2a2a', fontWeight: 400, position: 'sticky', top: 0, zIndex: 1, userSelect: 'none' },
  td:          { padding: '14px 16px', fontSize: 13, color: '#f0ece4', verticalAlign: 'middle' },
  check:       { width: 14, height: 14, border: '1px solid #3d3d3d', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 },
  checkActive: { background: '#c8b99a', borderColor: '#c8b99a' },
  bottomBar:   { background: '#151515', borderTop: '1px solid #2a2a2a', padding: '10px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
};
