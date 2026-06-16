import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DEMO_RESTAURANTS, DEMO_AUDITS } from '../data/demoData';

const SELECT_IDS = ['demo-1', 'demo-4', 'demo-6'];
const DECK_ID    = 'demo-6';

// ── Cursor positions for each phase (% of container) ─────────────────
const CURSOR_PATH = [
  { x: 50,  y: 75, label: 'Play' },         // 0: intro
  { x: 50,  y: 50, label: '' },              // 1: scraping — center spinner
  { x: 12,  y: 30, label: 'Select' },        // 2a: hover row 1
  { x: 12,  y: 42, label: 'Select' },        // 2b: hover row 4
  { x: 12,  y: 54, label: 'Select' },        // 2c: hover row 6
  { x: 82,  y: 8,  label: 'Run Audit' },     // 3: click audit btn
  { x: 50,  y: 40, label: '' },              // 4: audit running
  { x: 50,  y: 40, label: '' },              // 5: deck modal
  { x: 82,  y: 8,  label: 'Send' },          // 6: outreach modal
  { x: 50,  y: 75, label: 'Done' },          // 7: done
];

export default function Demo() {
  const [phase,       setPhase]       = useState('intro'); // intro | scraping | prospects | auditing | deck | outreach | done
  const [restaurants, setRestaurants] = useState(DEMO_RESTAURANTS.map(r => ({ ...r, selected: false, status: 'new' })));
  const [auditStep,   setAuditStep]   = useState(0); // 0,1,2,3 — which restaurants have audit results
  const [showModal,   setShowModal]   = useState(null); // null | 'deck' | 'outreach'
  const [imgVisible,  setImgVisible]  = useState(false);
  const [cursorPos,   setCursorPos]   = useState({ x: 50, y: 50 });
  const [cursorLabel, setCursorLabel] = useState('');
  const [cursorClick, setCursorClick] = useState(false);
  const [stepLabel,   setStepLabel]   = useState('');
  const timers = useRef([]);
  const rootRef = useRef(null);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const wait  = (ms, fn) => { const t = setTimeout(fn, ms); timers.current.push(t); };

  // Animate cursor to a position with easing
  const moveCursor = useCallback((x, y, label = '', delay = 0) => {
    wait(delay, () => {
      setCursorPos({ x, y });
      setCursorLabel(label);
    });
  }, []);

  const click = useCallback((delay = 0) => {
    wait(delay, () => {
      setCursorClick(true);
      wait(200, () => setCursorClick(false));
    });
  }, []);

  useEffect(() => () => clear(), []);

  const runDemo = useCallback(() => {
    clear();
    setRestaurants(DEMO_RESTAURANTS.map(r => ({ ...r, selected: false, status: 'new' })));
    setPhase('scraping');
    setAuditStep(0);
    setShowModal(null);
    setImgVisible(false);
    setStepLabel('Scraping Google Maps...');

    // Cursor during scraping
    moveCursor(50, 50, '', 0);

    // T=3s: Restaurants appear
    wait(3000, () => {
      setPhase('prospects');
      setStepLabel('Restaurants loaded');
      moveCursor(12, 33, 'Select');
    });

    // T=4.5s: Select row 1 (Karim's)
    wait(4500, () => {
      click(0);
      setRestaurants(prev => prev.map(r => r.id === 'demo-1' ? { ...r, selected: true } : r));
      moveCursor(12, 47, 'Select');
      setStepLabel('Selecting prospects');
    });

    // T=5.8s: Select row 4 (Soda Bottle)
    wait(5800, () => {
      click(0);
      setRestaurants(prev => prev.map(r => r.id === 'demo-4' ? { ...r, selected: true } : r));
      moveCursor(12, 61, 'Select');
    });

    // T=7s: Select row 6 (Lavaash)
    wait(7000, () => {
      click(0);
      setRestaurants(prev => prev.map(r => r.id === 'demo-6' ? { ...r, selected: true } : r));
      moveCursor(83, 9, 'Run Audit');
    });

    // T=8.5s: Click Run Audit
    wait(8500, () => {
      click(0);
      setPhase('auditing');
      setStepLabel('Running AI audit...');
      setRestaurants(prev => prev.map(r =>
        SELECT_IDS.includes(r.id) ? { ...r, status: 'auditing', selected: false } : r
      ));
      moveCursor(50, 45, '');
    });

    // T=10.5s: First audit result
    wait(10500, () => {
      setAuditStep(1);
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-1' ? { ...r, status: 'audited', audit: DEMO_AUDITS['demo-1'] } : r
      ));
      setStepLabel("Auditing Karim's...");
    });

    // T=12.5s: Second audit result
    wait(12500, () => {
      setAuditStep(2);
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-4' ? { ...r, status: 'audited', audit: DEMO_AUDITS['demo-4'] } : r
      ));
      setStepLabel('Auditing Soda Bottle...');
    });

    // T=14.5s: Third audit result
    wait(14500, () => {
      setAuditStep(3);
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-6' ? { ...r, status: 'audited', audit: DEMO_AUDITS['demo-6'] } : r
      ));
      setStepLabel('Audit complete');
    });

    // T=16s: Navigate to decks, show deck modal
    wait(16000, () => {
      setPhase('deck');
      setShowModal('deck');
      setStepLabel('Generating pitch deck...');
      moveCursor(83, 9, 'View Deck');
      click(0);
      wait(1200, () => setImgVisible(true));
    });

    // T=21s: Switch to outreach modal
    wait(21000, () => {
      setShowModal('outreach');
      setStepLabel('Drafting outreach email...');
      moveCursor(80, 9, 'Send');
      click(0);
    });

    // T=26s: Done
    wait(26000, () => {
      setShowModal(null);
      setPhase('done');
      setStepLabel('Pipeline complete');
      setRestaurants(prev => prev.map(r =>
        r.id === DECK_ID ? { ...r, status: 'sent' } : r
      ));
      moveCursor(50, 75, '');
    });
  }, [moveCursor, click]);

  const selectedCount  = restaurants.filter(r => r.selected).length;
  const auditedRests   = restaurants.filter(r => r.audit);
  const deckRest       = restaurants.find(r => r.id === DECK_ID);

  return (
    <div ref={rootRef} style={s.root}>

      {/* ── Custom cursor ───────────────────────────────── */}
      {phase !== 'intro' && (
        <div style={{
          ...s.cursor,
          left: `${cursorPos.x}%`,
          top:  `${cursorPos.y}%`,
          transform: `translate(-50%, -50%) scale(${cursorClick ? 0.75 : 1})`,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#c8b99a" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' }}>
            <path d="M4 2l16 10-7 1-4 7z"/>
          </svg>
          {cursorLabel && (
            <div style={s.cursorLabel}>{cursorLabel}</div>
          )}
        </div>
      )}

      {/* ── Demo badge ──────────────────────────────────── */}
      <div style={s.badge}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6fcf97', animation: 'pulse 2s infinite', flexShrink: 0 }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#9a9489', letterSpacing: '0.1em', textTransform: 'uppercase' }}>MESA Demo</span>
        {phase !== 'intro' && phase !== 'done' && (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#c8b99a' }}>{stepLabel}</span>
        )}
        {phase !== 'intro' && (
          <button style={s.replayBadgeBtn} onClick={runDemo}>↺</button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          INTRO SCREEN
      ══════════════════════════════════════════════════ */}
      {phase === 'intro' && (
        <div style={s.intro}>
          <div style={s.introInner}>
            <div style={s.introPipeline}>
              {['Scrape','Select','Audit','Deck','Send'].map((l, i, a) => (
                <React.Fragment key={l}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8b99a' }} />
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#5c5751', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</span>
                  </div>
                  {i < a.length - 1 && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#2a2a2a', paddingBottom: 13 }}>—</div>}
                </React.Fragment>
              ))}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: '#f0ece4', letterSpacing: '0.14em', marginBottom: 8 }}>MESA</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: '#5c5751', marginBottom: 10 }}>Restaurant Rebrand Outreach Studio</div>
            <div style={{ fontSize: 12, color: '#5c5751', lineHeight: 1.7, maxWidth: 300, margin: '0 auto 24px' }}>
              Watch MESA scrape Google Maps, audit brands with Claude AI, generate pitch decks, and draft outreach emails.
            </div>
            <button
              style={s.playBtn}
              onClick={() => { setPhase('_pre'); setTimeout(runDemo, 50); }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              Watch demo
            </button>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#3d3d3d', letterSpacing: '0.06em', marginTop: 10 }}>NO LOGIN · ~25 SECONDS</div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          APP SHELL (shown during all non-intro phases)
      ══════════════════════════════════════════════════ */}
      {phase !== 'intro' && phase !== '_pre' && (
        <div style={s.shell}>

          {/* Header */}
          <div style={s.hdr}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: '#f0ece4', letterSpacing: '0.14em' }}>MESA</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#6fcf97' }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#5c5751', letterSpacing: '0.08em', textTransform: 'uppercase' }}>New Delhi, IN</span>
              </div>
            </div>
            <div style={{ flex: 1, padding: '0 20px', borderLeft: '1px solid #2a2a2a', marginLeft: 16 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 500, color: '#f0ece4' }}>
                {phase === 'scraping' ? 'Prospects' : phase === 'prospects' ? 'Prospects' : phase === 'auditing' ? 'Audit Queue' : phase === 'deck' ? 'Decks' : phase === 'done' ? 'Sent' : 'Prospects'}
              </div>
              <div style={{ fontSize: 10, color: '#5c5751', marginTop: 1 }}>
                {phase === 'scraping'
                  ? <span style={{ color: '#c8b99a' }}>Crawling Google Maps...</span>
                  : `New Delhi · ${restaurants.length} restaurants`
                }
              </div>
            </div>
            {/* Run Audit button — shown only when selecting */}
            {phase === 'prospects' && selectedCount > 0 && (
              <div style={{
                ...s.hdrAuditBtn,
                animation: selectedCount === 3 ? 'pulse 1.2s infinite' : 'none',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                Run Audit ({selectedCount})
              </div>
            )}
            {/* Gold rule */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: '#2a2a2a' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #c8b99a, #6b5f4a44)', width: phase === 'intro' ? '0%' : '100%', transition: 'width 0.8s ease' }} />
            </div>
          </div>

          {/* Stats strip */}
          <div style={s.stats}>
            {[
              { n: phase === 'scraping' ? 0 : restaurants.length, l: 'Scraped' },
              { n: selectedCount, l: 'Selected' },
              { n: auditedRests.length, l: 'Audited' },
              { n: restaurants.filter(r => r.status === 'sent').length, l: 'Sent' },
            ].map((st, i) => (
              <div key={i} style={{ ...s.statCell, borderRight: i < 3 ? '1px solid #2a2a2a' : 'none' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500, color: st.n > 0 ? '#f0ece4' : '#2a2a2a', transition: 'color 0.4s' }}>{st.n}</div>
                <div style={{ fontSize: 9, color: '#5c5751', marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{st.l}</div>
              </div>
            ))}
          </div>

          {/* ── SCRAPING ───────────────────────────────── */}
          {phase === 'scraping' && (
            <div style={s.center}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ marginBottom: 12 }}>
                <circle cx="18" cy="18" r="14" stroke="#2a2a2a" strokeWidth="2"/>
                <circle cx="18" cy="18" r="14" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"
                  strokeDasharray="22 66" style={{ transformOrigin:'center', animation:'spin 1.1s linear infinite' }}/>
              </svg>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 500, color: '#f0ece4', marginBottom: 4 }}>Crawling Google Maps</div>
              <div style={{ fontSize: 11, color: '#5c5751' }}>Fetching restaurants from New Delhi...</div>
            </div>
          )}

          {/* ── PROSPECTS TABLE ─────────────────────────── */}
          {(phase === 'prospects') && (
            <div style={s.tableArea}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0e0e0e' }}>
                    {['', 'Restaurant', 'Rating', 'Photo', 'Status'].map((h, i) => (
                      <th key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5c5751', padding: '7px 10px', textAlign: 'left', borderBottom: '1px solid #2a2a2a', fontWeight: 400 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((r, i) => (
                    <tr key={r.id} style={{
                      borderBottom: '1px solid #1a1a1a',
                      background: r.selected ? '#1a1710' : '#151515',
                      borderLeft: `2px solid ${r.selected ? '#c8b99a' : 'transparent'}`,
                      transition: 'all 0.3s',
                    }}>
                      <td style={{ padding: '9px 10px', width: 28 }}>
                        <div style={{ width: 12, height: 12, border: `1px solid ${r.selected ? '#c8b99a' : '#3d3d3d'}`, borderRadius: 3, background: r.selected ? '#c8b99a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                          {r.selected && <svg width="7" height="5" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0e0e0e" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                        </div>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#f0ece4' }}>{r.name}</div>
                        <div style={{ fontSize: 9, color: '#5c5751', marginTop: 1 }}>{r.cuisine}</div>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: r.rating >= 4.2 ? '#6fcf97' : r.rating >= 3.8 ? '#f2994a' : '#eb5757' }}>{r.rating}</span>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#f0ece4' }}>{r.photoScore}<span style={{ color: '#3d3d3d', fontSize: 9 }}>/100</span></span>
                        <div style={{ height: 2, background: '#2a2a2a', borderRadius: 1, marginTop: 3, width: 36 }}>
                          <div style={{ height: '100%', borderRadius: 1, width: `${r.photoScore}%`, background: r.photoScore < 30 ? '#eb5757' : r.photoScore < 50 ? '#f2994a' : '#6fcf97' }} />
                        </div>
                      </td>
                      <td style={{ padding: '9px 10px' }}>
                        <StatusDot status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── AUDIT QUEUE ──────────────────────────────── */}
          {phase === 'auditing' && (
            <div style={s.auditArea}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 500, color: '#f0ece4', marginBottom: 10 }}>
                Audit Queue
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SELECT_IDS.map((id, i) => {
                  const r = restaurants.find(x => x.id === id);
                  if (!r) return null;
                  const done = r.status === 'audited';
                  return (
                    <div key={id} style={{ background: '#151515', border: `1px solid ${done ? '#2e2616' : '#2a2a2a'}`, borderRadius: 8, padding: '12px 14px', transition: 'border-color 0.4s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#f0ece4', marginBottom: 2 }}>{r.name}</div>
                          <div style={{ fontSize: 10, color: '#5c5751' }}>{r.cuisine} · {r.area}</div>
                          {done && r.audit && (
                            <div style={{ marginTop: 8, background: '#1a1710', border: '1px solid #2e2616', borderRadius: 6, padding: '8px 10px' }} className="fade-in">
                              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c8b99a', marginBottom: 4 }}>Pitch Angle</div>
                              <div style={{ fontSize: 11, color: '#f0ece4', fontStyle: 'italic', lineHeight: 1.5 }}>"{r.audit.pitchAngle}"</div>
                            </div>
                          )}
                        </div>
                        <div style={{ marginLeft: 10, flexShrink: 0 }}>
                          {done
                            ? <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#c8b99a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Audited</span>
                            : <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f2994a" strokeWidth="1.5" strokeLinecap="round" className="spin">
                                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                </svg>
                                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#f2994a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Auditing</span>
                              </div>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── DECKS / DONE ─────────────────────────────── */}
          {(phase === 'deck' || phase === 'done') && (
            <div style={s.deckListArea}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 500, color: '#f0ece4', marginBottom: 10 }}>
                {phase === 'done' ? 'Sent' : 'Decks'}
              </div>
              {SELECT_IDS.map(id => {
                const r = restaurants.find(x => x.id === id);
                if (!r || !r.audit) return null;
                return (
                  <div key={id} style={{ background: '#151515', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#f0ece4', marginBottom: 2 }}>{r.name}</div>
                      <div style={{ fontSize: 10, color: '#5c5751', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>"{r.audit.pitchAngle}"</div>
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: r.status === 'sent' ? '#c8b99a' : '#5c5751', letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0, marginLeft: 10 }}>
                      {r.status === 'sent' ? '✓ Sent' : 'Audited'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── DONE OVERLAY ────────────────────────────── */}
          {phase === 'done' && (
            <div style={s.doneOverlay} className="fade-in">
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a1710', border: '1px solid #2e2616', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8b99a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 500, color: '#f0ece4', marginBottom: 6 }}>Outreach sent.</div>
              <div style={{ fontSize: 11, color: '#9a9489', maxWidth: 280, lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                Scraped 7 restaurants, audited 3, generated decks, drafted emails — automated.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
                {['Scraped','Selected','Audited','Deck ready','Sent'].map((l, i, a) => (
                  <React.Fragment key={l}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#c8b99a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="7" height="5" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0e0e0e" strokeWidth="2" strokeLinecap="round"/></svg>
                      </div>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: '#9a9489', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{l}</span>
                    </div>
                    {i < a.length - 1 && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#3d3d3d' }}>→</span>}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: '8px 16px', background: 'transparent', color: '#9a9489', border: '1px solid #2a2a2a', borderRadius: 6, cursor: 'pointer' }} onClick={runDemo}>
                  ↺ Replay
                </button>
                <a href="https://mesa.visheshmahendru.com" target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, padding: '8px 16px', background: '#c8b99a', color: '#0e0e0e', borderRadius: 6, textDecoration: 'none' }}>
                  Try MESA →
                </a>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              DECK MODAL
          ══════════════════════════════════════════════ */}
          {showModal === 'deck' && deckRest && (
            <>
              <div style={s.backdrop} className="fade-in" />
              <div style={s.modal} className="scale-in">
                <div style={s.modalHdr}>
                  <div>
                    <div style={s.modalName}>{deckRest.name}</div>
                    <div style={s.modalMeta}>{deckRest.cuisine} · {deckRest.area} · Pitch deck</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={s.btnGhost}>↺ Regenerate</div>
                    <div style={s.btnGold}>↓ Download PDF</div>
                  </div>
                </div>
                <div style={s.modalScroll}>
                  {/* Two image placeholders side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'Hero food shot', bg: 'linear-gradient(135deg, #3D2314, #1C0A00)' },
                      { label: 'Brand texture', bg: 'linear-gradient(135deg, #2C1810, #3D2314)' },
                    ].map((img, i) => (
                      <div key={i} style={{ borderRadius: 8, aspectRatio: '16/9', background: img.bg, border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: imgVisible ? 1 : 0, transition: `opacity 0.6s ${i * 0.3}s` }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{img.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Palette */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={s.monoLbl}>Proposed Palette</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {['#3D2314','#E8D5B0','#1C0A00','#D4A840'].map(hex => (
                        <div key={hex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 5, background: hex, border: '1px solid #2a2a2a' }} />
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 7.5, color: '#5c5751' }}>{hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit 2-col */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    {[
                      { label: 'Brand Assessment', text: 'Delhi\'s only Armenian kitchen with chef credibility — but invisible online. 27/100 photo score, under 1,600 reviews. Brand underserves what the food delivers.' },
                      { label: 'Rebrand Direction', text: '#3D2314 terra cotta + #E8D5B0 parchment. Wedge-serif wordmark, humanist sans menus. Each dish with a 2-line cultural origin note.' },
                    ].map(({ label, text }) => (
                      <div key={label} style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 7, padding: '10px 12px' }}>
                        <div style={s.monoLbl}>{label}</div>
                        <div style={{ fontSize: 10.5, color: '#f0ece4', lineHeight: 1.6, marginTop: 5 }}>{text}</div>
                      </div>
                    ))}
                  </div>

                  {/* Pitch angle */}
                  <div style={{ background: '#1a1710', border: '1px solid #2e2616', borderRadius: 7, padding: '10px 14px' }}>
                    <div style={{ ...s.monoLbl, color: '#c8b99a', marginBottom: 5 }}>Pitch Angle · Email subject line</div>
                    <div style={{ fontSize: 12, color: '#f0ece4', fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{DEMO_AUDITS[DECK_ID].pitchAngle}"
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════
              OUTREACH MODAL
          ══════════════════════════════════════════════ */}
          {showModal === 'outreach' && deckRest && (
            <>
              <div style={s.backdrop} className="fade-in" />
              <div style={{ ...s.modal, maxWidth: 540 }} className="scale-in">
                <div style={s.modalHdr}>
                  <div>
                    <div style={s.modalName}>{deckRest.name}</div>
                    <div style={s.modalMeta}>Outreach email</div>
                  </div>
                </div>
                <div style={s.modalScroll}>
                  {/* Decision strip */}
                  <div style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 7, padding: '10px 14px', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#f0ece4', marginBottom: 3 }}>Is this a good prospect?</div>
                    <div style={{ fontSize: 10, color: '#5c5751', marginBottom: 10 }}>Approve to send. Reject to remove from pipeline.</div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, padding: '5px 12px', borderRadius: 5, border: '1px solid #3d1515', color: '#eb5757' }}>✕ Reject</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, padding: '5px 12px', borderRadius: 5, border: '1px solid #c8b99a', background: '#1a1710', color: '#c8b99a' }}>✓ Approved</div>
                    </div>
                  </div>

                  {/* Pitch angle */}
                  <div style={{ background: '#1a1710', border: '1px solid #2e2616', borderRadius: 7, padding: '10px 12px', marginBottom: 10 }}>
                    <div style={{ ...s.monoLbl, color: '#c8b99a', marginBottom: 4 }}>Pitch angle</div>
                    <div style={{ fontSize: 11, color: '#f0ece4', fontStyle: 'italic' }}>"{DEMO_AUDITS[DECK_ID].pitchAngle}"</div>
                  </div>

                  {/* Email */}
                  <div style={s.monoLbl}>Email draft</div>
                  <div style={{ marginTop: 6, background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontSize: 10.5, color: '#9a9489', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
{`Subject: ${DEMO_AUDITS[DECK_ID].pitchAngle}

Hi there,

I came across Lavaash by Saby while researching Armenian cuisine in Mehrauli — and I had thoughts on how a brand refresh could make you impossible to miss.

Delhi's only Armenian kitchen is a world-class secret. I've put together a short brand audit and visual direction — attached as a PDF.

Would you be open to a quick 20-minute call?

Best, [Your name]`}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 7, marginTop: 12 }}>
                    <div style={s.btnGhost}>⎘ Copy</div>
                    <div style={s.btnGold}>✉ Open in mail</div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}

// ── Tiny sub-components ────────────────────────────────────────

function StatusDot({ status }) {
  const colors = { new: '#3d3d3d', auditing: '#f2994a', audited: '#c8b99a', sent: '#6fcf97' };
  const labels = { new: 'New', auditing: 'Auditing', audited: 'Audited', sent: 'Sent' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: colors[status] || '#3d3d3d', flexShrink: 0 }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: colors[status] || '#3d3d3d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {labels[status] || status}
      </span>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const s = {
  root: {
    width: '100%', height: '100%',
    background: '#0e0e0e',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    // Critical: nothing overflows this container
    contain: 'strict',
  },

  // Custom cursor
  cursor: {
    position: 'absolute',
    zIndex: 1000,
    pointerEvents: 'none',
    transition: 'left 0.6s cubic-bezier(0.16,1,0.3,1), top 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.15s',
    display: 'flex', alignItems: 'flex-start', gap: 4,
  },
  cursorLabel: {
    background: '#c8b99a',
    color: '#0e0e0e',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 10, fontWeight: 500,
    padding: '2px 7px', borderRadius: 4,
    marginTop: 2, whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },

  // Badge
  badge: {
    position: 'absolute', top: 8, right: 8, zIndex: 600,
    display: 'flex', alignItems: 'center', gap: 7,
    background: 'rgba(21,21,21,0.96)', border: '1px solid #2a2a2a',
    borderRadius: 20, padding: '5px 10px',
    backdropFilter: 'blur(8px)',
  },
  replayBadgeBtn: {
    fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#5c5751',
    background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 2px',
  },

  // Intro
  intro: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0e0e', zIndex: 10 },
  introInner: { maxWidth: 360, width: '90%', textAlign: 'center' },
  introPipeline: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 },
  playBtn: {
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
    padding: '10px 24px', background: '#c8b99a', color: '#0e0e0e',
    border: 'none', borderRadius: 7, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 7,
    transition: 'transform 0.15s',
  },

  // Shell
  shell: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },

  // Header
  hdr: {
    background: '#151515', borderBottom: '1px solid #2a2a2a',
    padding: '10px 16px', flexShrink: 0,
    display: 'flex', alignItems: 'center',
    position: 'relative',
  },
  hdrAuditBtn: {
    fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
    padding: '6px 12px', background: '#c8b99a', color: '#0e0e0e',
    borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5,
    flexShrink: 0, marginLeft: 'auto',
  },

  // Stats
  stats: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    background: '#151515', borderBottom: '1px solid #2a2a2a', flexShrink: 0,
  },
  statCell: { padding: '8px 14px' },

  // Shared content areas — all overflow hidden, no scroll
  center:      { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  tableArea:   { flex: 1, overflow: 'hidden' },
  auditArea:   { flex: 1, overflow: 'hidden', padding: '12px 14px' },
  deckListArea:{ flex: 1, overflow: 'hidden', padding: '12px 14px', position: 'relative' },

  // Done overlay
  doneOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(14,14,14,0.96)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },

  // Modals
  backdrop: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 200 },
  modal: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '88%', maxWidth: 680,
    maxHeight: '88%',
    background: '#151515',
    borderRadius: 12, border: '1px solid #2a2a2a',
    zIndex: 201,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
  },
  modalHdr: {
    padding: '14px 18px', borderBottom: '1px solid #2a2a2a',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0,
  },
  modalName: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 500, color: '#f0ece4' },
  modalMeta: { fontSize: 10, color: '#5c5751', marginTop: 2 },
  modalScroll: { flex: 1, overflow: 'hidden', padding: '14px 18px' },

  btnGhost: { fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: '6px 12px', borderRadius: 5, border: '1px solid #2a2a2a', color: '#9a9489' },
  btnGold:  { fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, padding: '6px 12px', borderRadius: 5, background: '#c8b99a', color: '#0e0e0e' },
  monoLbl:  { fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c5751' },
};
