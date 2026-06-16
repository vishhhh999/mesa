import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DEMO_RESTAURANTS, DEMO_AUDITS, DEMO_STEPS } from '../data/demoData';
import { PipelineTrack, StatusTag } from './DesignSystem';

// IDs of restaurants that get selected + audited in the demo
const DEMO_SELECT_IDS  = ['demo-1', 'demo-4', 'demo-6'];
const DECK_RESTAURANT_ID = 'demo-6'; // Lavaash — shown in deck modal

export default function Demo() {
  const [restaurants, setRestaurants] = useState(DEMO_RESTAURANTS);
  const [step,        setStep]        = useState(-1); // -1 = intro
  const [activeModal, setActiveModal] = useState(null); // 'deck' | 'outreach' | null
  const [scraping,    setScraping]    = useState(false);
  const [auditLine,   setAuditLine]   = useState(0); // which audit text is visible
  const [showDeckImg, setShowDeckImg] = useState(false);
  const [started,     setStarted]     = useState(false);
  const timers = useRef([]);

  const clearTimers = () => timers.current.forEach(clearTimeout);

  const after = (ms, fn) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  const runDemo = useCallback(() => {
    clearTimers();
    setRestaurants(DEMO_RESTAURANTS);
    setStep(0);
    setScraping(true);
    setActiveModal(null);
    setAuditLine(0);
    setShowDeckImg(false);

    // Step 0: Scraping animation
    after(2800, () => {
      setScraping(false);
      setStep(1); // restaurants loaded
    });

    // Step 1 → Step 2: Select restaurants one by one
    after(4200, () => {
      setStep(2);
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-1' ? { ...r, selected: true } : r
      ));
    });
    after(5000, () => {
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-4' ? { ...r, selected: true } : r
      ));
    });
    after(5800, () => {
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-6' ? { ...r, selected: true } : r
      ));
    });

    // Step 3: Run audit — mark as auditing
    after(7200, () => {
      setStep(3);
      setRestaurants(prev => prev.map(r =>
        DEMO_SELECT_IDS.includes(r.id) ? { ...r, status: 'auditing', selected: false } : r
      ));
    });

    // Reveal audit results one by one
    after(9000, () => {
      setAuditLine(1);
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-1' ? { ...r, status: 'audited', audit: DEMO_AUDITS['demo-1'] } : r
      ));
    });
    after(11000, () => {
      setAuditLine(2);
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-4' ? { ...r, status: 'audited', audit: DEMO_AUDITS['demo-4'] } : r
      ));
    });
    after(13000, () => {
      setAuditLine(3);
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-6' ? { ...r, status: 'audited', audit: DEMO_AUDITS['demo-6'] } : r
      ));
    });

    // Step 4: Audited — navigate to decks
    after(14500, () => {
      setStep(4);
    });

    // Step 5: Open deck modal
    after(16000, () => {
      setStep(5);
      setActiveModal('deck');
      after(1800, () => setShowDeckImg(true));
    });

    // Step 6: Close deck, open outreach
    after(20500, () => {
      setActiveModal('outreach');
      setStep(6);
    });

    // Step 7: Done
    after(24500, () => {
      setActiveModal(null);
      setStep(7);
      setRestaurants(prev => prev.map(r =>
        r.id === 'demo-6' ? { ...r, status: 'sent', notes: 'Sent via MESA outreach' } : r
      ));
    });

  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const deckRest = restaurants.find(r => r.id === DECK_RESTAURANT_ID);
  const auditedRests = restaurants.filter(r => r.audit);
  const currentStepLabel = step >= 0 && step < DEMO_STEPS.length ? DEMO_STEPS[step].label : '';

  return (
    <div style={s.root}>
      {/* Demo ribbon */}
      <div style={s.ribbon}>
        <div style={s.ribbonDot} />
        <span style={s.ribbonText}>MESA · Live Demo</span>
        {started && step < 7 && (
          <span style={s.ribbonStatus}>{currentStepLabel}</span>
        )}
        {started && (
          <button style={s.ribbonBtn} onClick={runDemo}>↺ Replay</button>
        )}
      </div>

      {/* Intro overlay */}
      {!started && (
        <div style={s.intro} className="fade-in">
          <div style={s.introCard}>
            {/* Animated pipeline preview */}
            <div style={s.pipelinePreview}>
              {['Scrape', 'Select', 'Audit', 'Deck', 'Send'].map((label, i) => (
                <React.Fragment key={label}>
                  <div style={s.pipeStep}>
                    <div style={s.pipeStepDot} />
                    <div style={s.pipeStepLabel}>{label}</div>
                  </div>
                  {i < 4 && <div style={s.pipeArrow}>→</div>}
                </React.Fragment>
              ))}
            </div>

            <div style={s.introLogo}>MESA</div>
            <div style={s.introTitle}>Restaurant Rebrand Outreach Studio</div>
            <div style={s.introDesc}>
              Watch MESA scrape Google Maps, run AI brand audits, generate pitch decks, and draft outreach emails — all in one automated pipeline.
            </div>

            <button style={s.startBtn} onClick={() => { setStarted(true); runDemo(); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Watch demo
            </button>
            <div style={s.introNote}>No login required · 25 second walkthrough</div>
          </div>
        </div>
      )}

      {/* Main demo UI */}
      {started && (
        <div style={s.appWrap}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.wordmark}>MESA</div>
              <div style={s.locationTag}>
                <span style={s.locationDot} />
                New Delhi, IN
              </div>
            </div>
            <div style={s.headerCenter}>
              <div style={s.viewTitle}>
                {step <= 4 ? 'Prospects' : step === 5 ? 'Decks' : step === 6 ? 'Outreach' : 'Sent'}
              </div>
              <div style={s.viewMeta}>
                {scraping
                  ? <span style={{ color: '#c8b99a' }}>Crawling Google Maps...</span>
                  : step >= 1
                    ? `New Delhi · ${restaurants.length} restaurants`
                    : 'No data yet'
                }
              </div>
            </div>
            <div style={s.headerRight}>
              {step === 2 && (
                <div style={s.auditBtn}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                  Run Audit (3)
                </div>
              )}
            </div>
            {/* Animated gold rule */}
            <div style={s.goldRule}>
              <div style={{
                ...s.goldRuleFill,
                width: started ? '100%' : '0%',
                transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>

          {/* Stats strip */}
          <div style={s.statsStrip}>
            {[
              { num: step >= 1 ? restaurants.length : 0, label: 'Scraped' },
              { num: restaurants.filter(r => r.selected).length, label: 'Selected' },
              { num: restaurants.filter(r => ['audited','mocked','sent'].includes(r.status)).length, label: 'Audited' },
              { num: restaurants.filter(r => r.status === 'sent').length, label: 'Sent' },
            ].map((st, i) => (
              <div key={i} style={{ ...s.statCell, borderRight: i < 3 ? '1px solid #2a2a2a' : 'none' }}>
                <div style={{ ...s.statNum, color: st.num > 0 ? '#f0ece4' : '#3d3d3d', transition: 'color 0.3s' }}>
                  {st.num}
                </div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div style={s.content}>

            {/* SCRAPING state */}
            {scraping && (
              <div style={s.scrapingState} className="fade-in">
                <div style={s.scrapingSpinner}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="16" stroke="#2a2a2a" strokeWidth="2"/>
                    <circle cx="20" cy="20" r="16" stroke="#c8b99a" strokeWidth="2"
                      strokeLinecap="round" strokeDasharray="26 76"
                      style={{ transformOrigin:'center', animation:'spin 1.2s linear infinite' }}/>
                  </svg>
                </div>
                <div style={s.scrapingTitle}>Scraping Google Maps</div>
                <div style={s.scrapingMeta}>Pulling restaurants from New Delhi...</div>
              </div>
            )}

            {/* PROSPECTS TABLE */}
            {!scraping && step <= 4 && step >= 1 && (
              <div style={s.tableWrap} className="view-enter">
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={{ ...s.th, width: 32 }}></th>
                      <th style={s.th}>Restaurant</th>
                      <th style={s.th}>Rating</th>
                      <th style={s.th}>Photo score</th>
                      <th style={s.th}>Pipeline</th>
                      <th style={s.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((r, i) => (
                      <tr key={r.id} className="stagger-item" style={{
                        animationDelay: `${i * 45}ms`,
                        borderBottom: '1px solid #1f1f1f',
                        background: r.selected ? '#1a1710' : r.status === 'auditing' ? '#111008' : '#151515',
                        borderLeft: `2px solid ${r.selected ? '#c8b99a' : r.status === 'auditing' ? '#f2994a33' : 'transparent'}`,
                        transition: 'all 0.3s',
                      }}>
                        <td style={s.td}>
                          <div style={{
                            width: 14, height: 14, border: `1px solid ${r.selected ? '#c8b99a' : '#3d3d3d'}`,
                            borderRadius: 3, background: r.selected ? '#c8b99a' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* AUDIT QUEUE */}
            {step === 3 && (
              <div style={s.auditQueue} className="view-enter">
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 500, color: '#f0ece4', marginBottom: 16 }}>
                  Audit Queue
                </div>
                {DEMO_SELECT_IDS.map((id, i) => {
                  const r = restaurants.find(x => x.id === id);
                  if (!r) return null;
                  return (
                    <div key={id} style={{
                      ...s.auditCard,
                      animationDelay: `${i * 300}ms`,
                      opacity: r.status === 'audited' ? 1 : 0.7,
                      transition: 'opacity 0.5s',
                    }} className="stagger-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: r.audit ? 14 : 0 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: '#f0ece4' }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: '#5c5751', marginTop: 2 }}>{r.cuisine} · {r.area}</div>
                        </div>
                        {r.status === 'auditing' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f2994a" strokeWidth="1.5" strokeLinecap="round" className="spin">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                            </svg>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#f2994a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Auditing</span>
                          </div>
                        )}
                        {r.status === 'audited' && (
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#c8b99a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Audited</span>
                        )}
                      </div>
                      {r.audit && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} className="view-enter">
                          <AuditBlockDemo label="Brand assessment"  text={r.audit.brandAssessment} />
                          <AuditBlockDemo label="Rebrand direction" text={r.audit.rebrandDirection} />
                          <AuditBlockDemo label="Pitch angle"       text={r.audit.pitchAngle} accent />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* DONE state */}
            {step === 7 && (
              <div style={s.doneState} className="view-enter">
                <div style={s.doneIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c8b99a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </div>
                <div style={s.doneTitle}>Outreach sent.</div>
                <div style={s.doneDesc}>
                  MESA scraped 7 restaurants, audited 3 with Claude, generated a pitch deck, and drafted the outreach email — in under 30 seconds.
                </div>
                <div style={s.donePipeline}>
                  {['Scraped', 'Selected', 'Audited', 'Deck ready', 'Sent'].map((label, i) => (
                    <React.Fragment key={label}>
                      <div style={s.donePipeStep}>
                        <div style={s.donePipeDot}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="#0e0e0e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span style={s.donePipeLabel}>{label}</span>
                      </div>
                      {i < 4 && <div style={s.donePipeArrow}>→</div>}
                    </React.Fragment>
                  ))}
                </div>
                <button style={s.replayBtn} onClick={runDemo}>
                  ↺ Watch again
                </button>
                <a href="https://mesa.visheshmahendru.com" target="_blank" rel="noopener noreferrer" style={s.tryBtn}>
                  Try MESA with your own data →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DECK MODAL */}
      {activeModal === 'deck' && deckRest && (
        <>
          <div style={s.backdrop} className="fade-in" />
          <div style={s.modal} className="scale-in">
            <div style={s.modalHdr}>
              <div>
                <div style={s.modalName}>{deckRest.name}</div>
                <div style={s.modalMeta}>{deckRest.cuisine} · {deckRest.area} · Pitch deck</div>
              </div>
              <div style={s.modalActions}>
                <div style={s.modalBtnGhost}>↺ Regenerate</div>
                <div style={s.modalBtnGold}>↓ Download PDF</div>
              </div>
            </div>
            <div style={s.modalBody}>
              {/* Image placeholders */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Hero food shot', bg: 'linear-gradient(135deg, #3D2314 0%, #1C0A00 100%)' },
                  { label: 'Brand texture shot', bg: 'linear-gradient(135deg, #2C1810 0%, #3D2314 100%)' },
                ].map((img, i) => (
                  <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #2a2a2a', aspectRatio: '1', background: img.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: showDeckImg ? 1 : 0, transition: `opacity 0.5s ${i * 0.25}s` }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {img.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Palette */}
              <div style={{ marginBottom: 18 }}>
                <div style={s.monoLabel}>Proposed Palette</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  {['#3D2314', '#E8D5B0', '#1C0A00', '#D4A840'].map(hex => (
                    <div key={hex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 6, background: hex, border: '1px solid #2a2a2a' }} />
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#5c5751' }}>{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit sections */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <AuditBlockDemo label="Brand Assessment"  text={DEMO_AUDITS['demo-6'].brandAssessment} />
                <AuditBlockDemo label="Rebrand Direction" text={DEMO_AUDITS['demo-6'].rebrandDirection} />
              </div>

              {/* Pitch angle */}
              <div style={{ background: '#1a1710', border: '1px solid #2e2616', borderRadius: 10, padding: '14px 18px' }}>
                <div style={{ ...s.monoLabel, color: '#c8b99a', marginBottom: 8 }}>Pitch Angle · Email subject</div>
                <div style={{ fontSize: 14, color: '#f0ece4', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{DEMO_AUDITS['demo-6'].pitchAngle}"
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* OUTREACH MODAL */}
      {activeModal === 'outreach' && deckRest && (
        <>
          <div style={s.backdrop} className="fade-in" />
          <div style={{ ...s.modal, maxWidth: 620 }} className="scale-in">
            <div style={s.modalHdr}>
              <div>
                <div style={s.modalName}>{deckRest.name}</div>
                <div style={s.modalMeta}>{deckRest.cuisine} · {deckRest.area} · Outreach</div>
              </div>
            </div>
            <div style={s.modalBody}>
              <div style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#f0ece4', marginBottom: 4 }}>Is this a good prospect?</div>
                <div style={{ fontSize: 11, color: '#5c5751', marginBottom: 14 }}>Approve to send the outreach email. Reject to remove from pipeline.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #3d1515', color: '#eb5757', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>✕ Reject</div>
                  <div style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #c8b99a', background: '#1a1710', color: '#c8b99a', fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>✓ Approved</div>
                </div>
              </div>

              <div style={{ background: '#1a1710', border: '1px solid #2e2616', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ ...s.monoLabel, color: '#c8b99a', marginBottom: 6 }}>Pitch Angle</div>
                <div style={{ fontSize: 13, color: '#f0ece4', fontStyle: 'italic' }}>"{DEMO_AUDITS['demo-6'].pitchAngle}"</div>
              </div>

              <div style={s.monoLabel}>Email Draft</div>
              <div style={{ marginTop: 8, background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9a9489', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
{`Subject: ${DEMO_AUDITS['demo-6'].pitchAngle}

Hi there,

I came across Lavaash by Saby while researching Armenian cuisine in Mehrauli, and I had some thoughts on how a brand refresh could really elevate how you're perceived online.

Delhi's only Armenian kitchen is a world-class secret — and right now the brand isn't helping people find it. I've put together a short brand audit and some visual direction that I think you'd find interesting.

The attached PDF covers a rebrand direction, color palette, and proposal for what we'd build together.

Would you be open to a quick 20-minute call?

Best,
[Your name]`}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <div style={s.modalBtnGhost}>⎘ Copy email</div>
                <div style={s.modalBtnGold}>✉ Open in mail</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function AuditBlockDemo({ label, text, accent }) {
  return (
    <div style={{
      background: accent ? '#1a1710' : '#0e0e0e',
      border: `1px solid ${accent ? '#2e2616' : '#2a2a2a'}`,
      borderRadius: 8, padding: '10px 14px',
    }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent ? '#c8b99a' : '#5c5751', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: '#f0ece4', lineHeight: 1.65 }}>{text}</div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const s = {
  root:        { width: '100%', height: '100%', minHeight: 600, background: '#0e0e0e', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' },

  // Ribbon
  ribbon:      { position: 'absolute', top: 10, right: 10, zIndex: 500, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(21,21,21,0.95)', border: '1px solid #2a2a2a', borderRadius: 20, padding: '5px 12px', backdropFilter: 'blur(8px)' },
  ribbonDot:   { width: 6, height: 6, borderRadius: '50%', background: '#6fcf97', flexShrink: 0, animation: 'pulse 2s infinite' },
  ribbonText:  { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#9a9489', letterSpacing: '0.08em', textTransform: 'uppercase' },
  ribbonStatus: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#c8b99a' },
  ribbonBtn:   { fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#5c5751', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px' },

  // Intro
  intro:       { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0e0e', zIndex: 10 },
  introCard:   { maxWidth: 480, width: '90%', textAlign: 'center', padding: 40 },
  pipelinePreview: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 },
  pipeStep:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  pipeStepDot: { width: 8, height: 8, borderRadius: '50%', background: '#c8b99a' },
  pipeStepLabel: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#5c5751', letterSpacing: '0.08em', textTransform: 'uppercase' },
  pipeArrow:   { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#3d3d3d', marginBottom: 14 },
  introLogo:   { fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: '#f0ece4', letterSpacing: '0.14em', marginBottom: 10 },
  introTitle:  { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 400, color: '#9a9489', marginBottom: 14 },
  introDesc:   { fontSize: 13, color: '#5c5751', lineHeight: 1.7, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' },
  startBtn:    { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, padding: '12px 28px', background: '#c8b99a', color: '#0e0e0e', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12, transition: 'transform 0.15s' },
  introNote:   { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#3d3d3d', letterSpacing: '0.06em' },

  // App shell
  appWrap:     { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  header:      { background: '#151515', borderBottom: '1px solid #2a2a2a', flexShrink: 0, position: 'relative' },
  headerLeft:  { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 2 },
  wordmark:    { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0ece4', letterSpacing: '0.14em' },
  locationTag: { display: 'flex', alignItems: 'center', gap: 5 },
  locationDot: { width: 4, height: 4, borderRadius: '50%', background: '#6fcf97', display: 'inline-block' },
  headerCenter: { padding: '14px 16px 14px 100px', textAlign: 'left' },
  viewTitle:   { fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 500, color: '#f0ece4' },
  viewMeta:    { fontSize: 11, color: '#5c5751', marginTop: 2 },
  headerRight: { position: 'absolute', right: 90, top: '50%', transform: 'translateY(-50%)' },
  auditBtn:    { fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, padding: '7px 14px', background: '#c8b99a', color: '#0e0e0e', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5, animation: 'pulse 1.5s infinite' },
  goldRule:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: '#2a2a2a', overflow: 'hidden' },
  goldRuleFill: { height: '100%', background: 'linear-gradient(90deg, #c8b99a, #6b5f4a55)' },

  // Stats
  statsStrip:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: '#151515', borderBottom: '1px solid #2a2a2a', flexShrink: 0 },
  statCell:    { padding: '10px 20px' },
  statNum:     { fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 500 },
  statLabel:   { fontSize: 10, color: '#5c5751', marginTop: 2 },

  // Content
  content:     { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' },

  // Scraping
  scrapingState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 },
  scrapingSpinner: { marginBottom: 4 },
  scrapingTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 500, color: '#f0ece4' },
  scrapingMeta:  { fontSize: 12, color: '#5c5751' },

  // Table
  tableWrap:   { flex: 1, overflowY: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5c5751', padding: '9px 14px', textAlign: 'left', background: '#0e0e0e', borderBottom: '1px solid #2a2a2a', fontWeight: 400, position: 'sticky', top: 0, zIndex: 1 },
  td:          { padding: '13px 14px', fontSize: 13, color: '#f0ece4', verticalAlign: 'middle' },

  // Audit queue
  auditQueue:  { flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 },
  auditCard:   { background: '#151515', border: '1px solid #2a2a2a', borderRadius: 10, padding: 18 },

  // Done
  doneState:   { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' },
  doneIcon:    { width: 52, height: 52, borderRadius: '50%', background: '#1a1710', border: '1px solid #2e2616', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  doneTitle:   { fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 500, color: '#f0ece4', marginBottom: 10 },
  doneDesc:    { fontSize: 13, color: '#9a9489', maxWidth: 360, lineHeight: 1.7, marginBottom: 24 },
  donePipeline: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 },
  donePipeStep: { display: 'flex', alignItems: 'center', gap: 6 },
  donePipeDot: { width: 16, height: 16, borderRadius: '50%', background: '#c8b99a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  donePipeLabel: { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#9a9489', letterSpacing: '0.06em', textTransform: 'uppercase' },
  donePipeArrow: { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#3d3d3d' },
  replayBtn:   { fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: '10px 22px', background: 'transparent', color: '#9a9489', border: '1px solid #2a2a2a', borderRadius: 8, cursor: 'pointer', marginBottom: 10 },
  tryBtn:      { fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, padding: '10px 22px', background: '#c8b99a', color: '#0e0e0e', borderRadius: 8, textDecoration: 'none', display: 'inline-block' },

  // Modals
  backdrop:    { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 200 },
  modal:       { position: 'absolute', top: '3%', left: '50%', transform: 'translateX(-50%)', width: '92%', maxWidth: 800, maxHeight: '94%', background: '#151515', borderRadius: 14, border: '1px solid #2a2a2a', zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' },
  modalHdr:    { padding: '16px 20px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  modalName:   { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 500, color: '#f0ece4' },
  modalMeta:   { fontSize: 11, color: '#5c5751', marginTop: 2 },
  modalActions: { display: 'flex', gap: 8 },
  modalBtnGhost: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 6, border: '1px solid #2a2a2a', color: '#9a9489', cursor: 'default' },
  modalBtnGold:  { fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, padding: '7px 14px', borderRadius: 6, background: '#c8b99a', color: '#0e0e0e', cursor: 'default' },
  modalBody:   { flex: 1, overflowY: 'auto', padding: 20 },

  monoLabel:   { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c5751' },
};
