import React, { useState } from 'react';
import PipelineTrack from './PipelineTrack';
import StatusTag from './StatusTag';
import { useTheme } from '../context/ThemeContext';
import RestaurantDrawer from './RestaurantDrawer';

export default function ProspectsView({ restaurants, onToggle, onSelectAll, onDeselectAll, onRunAudit, onScrape, scraping, scrapeStatus, scrapeError, onGoSettings, locationLabel }) {
  const { theme } = useTheme();
  const [sortBy, setSortBy] = useState('photoScore');
  const [sortDir, setSortDir] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [drawerRestaurant, setDrawerRestaurant] = useState(null);

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
    return <i className={`ti ti-chevron-${sortDir === 'asc' ? 'up' : 'down'}`} style={{ fontSize: 11, marginLeft: 3, color: theme.accent }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Topbar */}
      <div style={{ background: theme.surface, borderBottom: `0.5px solid ${theme.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>Prospects</div>
          <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 1 }}>
            {scraping
              ? <span style={{ color: theme.accent }}>{scrapeStatus || 'Scraping...'}</span>
              : restaurants.length > 0
                ? `${locationLabel} · ${restaurants.length} restaurants · last scraped ${getLastScraped(restaurants)}`
                : `${locationLabel || 'No location set'} · Hit Scrape to begin`
            }
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <button style={btnGhost(theme, scraping)} onClick={onScrape} disabled={scraping}>
              <i className={`ti ${scraping ? 'ti-loader-2' : 'ti-refresh'}`} style={{ fontSize: 13 }} />
              {scraping ? 'Scraping...' : 'Scrape'}
            </button>
            {scrapeError && <span style={{ fontSize: 11, color: '#E24B4A', maxWidth: 260, textAlign: 'right', lineHeight: 1.4 }}>{scrapeError}</span>}
          </div>
          <button
            style={{ ...btnPrimary(theme), opacity: selected.length === 0 ? 0.45 : 1 }}
            disabled={selected.length === 0}
            onClick={() => onRunAudit(selected)}
          >
            <i className="ti ti-player-play" style={{ fontSize: 13 }} />
            Run Audit ({selected.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `0.5px solid ${theme.border}`, background: theme.statBg, flexShrink: 0 }}>
        {[
          { num: restaurants.length, label: 'Total scraped' },
          { num: selected.length, label: 'Selected' },
          { num: restaurants.filter(r => r.status === 'mocked' || r.status === 'audited').length, label: 'Audited' },
          { num: restaurants.filter(r => r.status === 'sent' || r.status === 'replied').length, label: 'Emails sent' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '14px 24px', borderRight: i < 3 ? `0.5px solid ${theme.border}` : 'none' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: theme.ink }}>{s.num}</div>
            <div style={{ fontSize: 11, color: theme.inkMuted, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', borderBottom: `0.5px solid ${theme.border}`, background: theme.surface, paddingLeft: 24, flexShrink: 0 }}>
        {['all', 'new', 'audited', 'mocked', 'sent', 'replied'].map(f => {
          const active = filterStatus === f;
          return (
            <button key={f} style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: 12, padding: '10px 14px',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${active ? theme.accent : 'transparent'}`,
              color: active ? theme.accent : theme.inkMuted,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
            }} onClick={() => setFilterStatus(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, background: theme.filterCountBg, color: theme.filterCountColor, padding: '1px 5px', borderRadius: 10 }}>
                {f === 'all' ? restaurants.length : restaurants.filter(r => r.status === f).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {restaurants.length === 0 && !scraping && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
          <i className="ti ti-map-pin-off" style={{ fontSize: 32, color: theme.emptyIconColor, marginBottom: 14 }} aria-hidden="true" />
          <div style={{ fontSize: 15, fontWeight: 500, color: theme.ink, marginBottom: 8 }}>No restaurants yet</div>
          <div style={{ fontSize: 13, color: theme.inkMuted, maxWidth: 340, lineHeight: 1.65 }}>
            {locationLabel ? `Hit Scrape to pull restaurants from ${locationLabel}.` : 'Set a target location in Settings, then hit Scrape.'}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button style={btnGhost(theme)} onClick={onGoSettings}>
              <i className="ti ti-adjustments-horizontal" style={{ fontSize: 13 }} /> Settings
            </button>
            <button style={{ ...btnPrimary(theme), opacity: scraping ? 0.6 : 1 }} onClick={onScrape} disabled={scraping}>
              <i className={`ti ${scraping ? 'ti-loader-2' : 'ti-refresh'}`} style={{ fontSize: 13 }} />
              {scraping ? 'Scraping...' : `Scrape ${locationLabel || ''}`}
            </button>
          </div>
          {scrapeError && <div style={{ marginTop: 12, fontSize: 11, color: '#E24B4A', maxWidth: 340, lineHeight: 1.5 }}>{scrapeError}</div>}
        </div>
      )}

      {/* Scraping loading state */}
      {scraping && restaurants.length === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 28, color: theme.accent }} aria-hidden="true" />
          <div style={{ fontSize: 14, color: theme.ink, fontWeight: 500 }}>Scraping Google Maps...</div>
          <div style={{ fontSize: 12, color: theme.inkMuted }}>{scrapeStatus}</div>
        </div>
      )}

      {/* Table */}
      {restaurants.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th(theme), width: 40 }}>
                  <div
                    style={{ width: 16, height: 16, border: `1.5px solid ${selected.length === filtered.length && filtered.length > 0 ? theme.accent : '#D4D0C8'}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: selected.length === filtered.length && filtered.length > 0 ? theme.accent : 'transparent' }}
                    onClick={() => selected.length === filtered.length ? onDeselectAll() : onSelectAll()}
                  >
                    {selected.length === filtered.length && filtered.length > 0 && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />}
                  </div>
                </th>
                <th style={{ ...th(theme), cursor: 'pointer' }} onClick={() => handleSort('name')}>Restaurant <SortIcon col="name" /></th>
                <th style={{ ...th(theme), cursor: 'pointer' }} onClick={() => handleSort('rating')}>Rating <SortIcon col="rating" /></th>
                <th style={{ ...th(theme), cursor: 'pointer' }} onClick={() => handleSort('photoScore')}>Photo score <SortIcon col="photoScore" /></th>
                <th style={th(theme)}>Pipeline</th>
                <th style={th(theme)}>Status</th>
                <th style={{ ...th(theme), width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: theme.inkMuted, fontSize: 13, padding: 48 }}>No restaurants in this filter.</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: `0.5px solid ${theme.borderLight}`, cursor: 'pointer', background: r.selected ? theme.tableRowSelected : theme.tableRow }} onClick={() => onToggle(r.id)}>
                  <td style={td(theme)}>
                    <div style={{ width: 16, height: 16, border: `1.5px solid ${r.selected ? theme.accent : '#D4D0C8'}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: r.selected ? theme.accent : 'transparent', flexShrink: 0 }}>
                      {r.selected && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />}
                    </div>
                  </td>
                  <td style={td(theme)}>
                    <div style={{ fontWeight: 500, fontSize: 13, color: theme.ink }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: theme.inkMuted, marginTop: 2 }}>{r.cuisine} · {r.area}</div>
                  </td>
                  <td style={td(theme)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.rating >= 4.2 ? '#639922' : r.rating >= 3.8 ? '#EF9F27' : '#E24B4A', flexShrink: 0 }} />
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: theme.ink }}>{r.rating}</span>
                    </div>
                  </td>
                  <td style={td(theme)}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: theme.ink }}>{r.photoScore}<span style={{ color: theme.inkFaint, fontSize: 10 }}>/100</span></div>
                    <div style={{ height: 3, background: theme.scoreBarBg, borderRadius: 2, marginTop: 4, width: 56 }}>
                      <div style={{ height: '100%', borderRadius: 2, width: `${r.photoScore}%`, background: r.photoScore < 30 ? '#E24B4A' : r.photoScore < 50 ? '#EF9F27' : '#639922' }} />
                    </div>
                  </td>
                  <td style={td(theme)}><PipelineTrack status={r.status} /></td>
                  <td style={td(theme)}><StatusTag status={r.status} /></td>
                  <td style={td(theme)} onClick={e => { e.stopPropagation(); setDrawerRestaurant(r); }}>
                    <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
                      <i className="ti ti-chevron-right" style={{ fontSize: 14, color: theme.inkMuted }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom bar */}
      <div style={{ background: theme.surface, borderTop: `0.5px solid ${theme.border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: theme.inkMuted }}>
          <span style={{ color: theme.accent, fontWeight: 500 }}>{selected.length}</span> of {restaurants.length} selected
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...btnGhost(theme), opacity: selected.length === 0 ? 0.4 : 1 }} disabled={selected.length === 0} onClick={onDeselectAll}>Deselect all</button>
          <button style={btnGhost(theme)} onClick={onSelectAll}>Select all</button>
        </div>
      </div>

      {/* Restaurant detail drawer */}
      {drawerRestaurant && (
        <RestaurantDrawer
          restaurant={restaurants.find(r => r.id === drawerRestaurant.id) || drawerRestaurant}
          onClose={() => setDrawerRestaurant(null)}
        />
      )}
    </div>
  );
}

function getLastScraped(restaurants) {
  const dates = restaurants.map(r => r.scrapedAt).filter(Boolean);
  if (dates.length === 0) return 'unknown';
  const latest = new Date(Math.max(...dates.map(d => new Date(d))));
  const mins = Math.round((Date.now() - latest) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

function th(theme) {
  return { fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase', color: theme.inkMuted, padding: '10px 14px', textAlign: 'left', background: theme.tableHead, borderBottom: `0.5px solid ${theme.border}`, fontWeight: 400, position: 'sticky', top: 0, zIndex: 1, userSelect: 'none' };
}
function td(theme) {
  return { padding: '13px 14px', fontSize: 13, color: theme.ink, verticalAlign: 'middle' };
}
function btnGhost(theme, disabled) {
  return { fontFamily: "'DM Sans',sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: theme.btnGhostBg, border: `0.5px solid ${theme.border}`, color: theme.btnGhostColor, transition: 'all 0.15s', opacity: disabled ? 0.6 : 1 };
}
function btnPrimary(theme) {
  return { fontFamily: "'DM Sans',sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: theme.accent, color: '#fff', border: 'none', transition: 'all 0.15s' };
}
