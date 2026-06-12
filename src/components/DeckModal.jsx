import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useKeys } from '../context/KeysContext';
import { generateDeckImages } from '../utils/imageGen';
import { generateDeckPDF } from '../utils/pdfGen';

const STAGE = {
  IDLE: 'idle',
  GENERATING: 'generating',
  READY: 'ready',
  ERROR: 'error',
};

export default function DeckModal({ restaurant, onClose, onUpdateRestaurant }) {
  const { theme } = useTheme();
  const { keys } = useKeys();
  const [stage, setStage] = useState(STAGE.IDLE);
  const [images, setImages] = useState(restaurant.deckImages || []);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const hasImages = images.length > 0;

  // Auto-generate if no images yet
  useEffect(() => {
    if (!hasImages && restaurant.audit) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    if (!keys.openaiKey) {
      setError('No OpenAI API key. Add it in Settings.');
      setStage(STAGE.ERROR);
      return;
    }
    setStage(STAGE.GENERATING);
    setError(null);
    try {
      const imgs = await generateDeckImages(
        restaurant,
        keys.openaiKey,
        (i, total) => setProgress(`Generating image ${i + 1} of ${total}...`)
      );
      setImages(imgs);
      setStage(STAGE.READY);
      setProgress('');
      // Persist images to restaurant record
      onUpdateRestaurant(restaurant.id, { deckImages: imgs, status: 'mocked' });
    } catch (err) {
      setError(err.message);
      setStage(STAGE.ERROR);
      setProgress('');
    }
  };

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const doc = await generateDeckPDF(restaurant, images);
      doc.save(`MESA_${restaurant.name.replace(/\s+/g, '_')}_deck.pdf`);
    } catch (err) {
      alert('PDF generation failed: ' + err.message);
    } finally {
      setPdfGenerating(false);
    }
  };

  const audit = restaurant.audit;
  const hexMatches = (audit?.rebrandDirection || '').match(/#[0-9A-Fa-f]{6}/g) || [];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: theme.overlay, zIndex: 200 }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0,
        zIndex: 201,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: 860,
          maxHeight: '92vh',
          background: theme.surface,
          borderRadius: 16,
          border: `0.5px solid ${theme.border}`,
          boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: 'all',
          animation: 'deckIn 0.22s ease',
        }}>
          <style>{`@keyframes deckIn { from { transform: scale(0.97) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }`}</style>

          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: `0.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 300, color: theme.ink, letterSpacing: '-0.3px' }}>
                {restaurant.name}
              </div>
              <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 2 }}>
                {restaurant.cuisine} · {restaurant.area} · Pitch deck
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {hasImages && (
                <button
                  onClick={handleGenerate}
                  style={btnGhost(theme)}
                  title="Regenerate images"
                >
                  <i className="ti ti-refresh" style={{ fontSize: 13 }} />
                  Regenerate
                </button>
              )}
              <button
                onClick={handleDownloadPDF}
                disabled={!hasImages || pdfGenerating}
                style={{ ...btnPrimary(theme), opacity: !hasImages || pdfGenerating ? 0.45 : 1 }}
              >
                <i className={`ti ${pdfGenerating ? 'ti-loader-2' : 'ti-download'}`} style={{ fontSize: 13 }} />
                {pdfGenerating ? 'Generating...' : 'Download PDF'}
              </button>
              <button onClick={onClose} style={{ ...btnGhost(theme), padding: '7px 9px' }}>
                <i className="ti ti-x" style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

            {/* Generating state */}
            {stage === STAGE.GENERATING && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 16 }}>
                <i className="ti ti-loader-2" style={{ fontSize: 32, color: theme.accent }} aria-hidden="true" />
                <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>Generating visual assets</div>
                <div style={{ fontSize: 12, color: theme.inkMuted }}>{progress}</div>
                <div style={{ fontSize: 11, color: theme.inkFaint, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
                  GPT-4o is generating food photography and brand visuals based on the audit direction. This takes 20–40 seconds.
                </div>
              </div>
            )}

            {/* Error state */}
            {stage === STAGE.ERROR && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12 }}>
                <i className="ti ti-alert-circle" style={{ fontSize: 28, color: '#E24B4A' }} aria-hidden="true" />
                <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>Image generation failed</div>
                <div style={{ fontSize: 12, color: '#E24B4A', maxWidth: 360, textAlign: 'center' }}>{error}</div>
                <button onClick={handleGenerate} style={btnPrimary(theme)}>Try again</button>
              </div>
            )}

            {/* Deck preview */}
            {(stage === STAGE.READY || hasImages) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Images row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: `0.5px solid ${theme.border}`, aspectRatio: '1', background: theme.surfaceAlt }}>
                      <img
                        src={`data:image/png;base64,${img}`}
                        alt={`Brand visual ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Color palette */}
                {hexMatches.length > 0 && (
                  <div>
                    <div style={monoLabel(theme)}>Proposed Palette</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      {hexMatches.slice(0, 4).map((hex, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 8, background: hex, border: `0.5px solid ${theme.border}` }} />
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: theme.inkMuted }}>{hex.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audit sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <DeckSection theme={theme} label="Brand Assessment" text={audit?.brandAssessment} />
                  <DeckSection theme={theme} label="Rebrand Direction" text={audit?.rebrandDirection} />
                </div>

                {/* Pitch angle */}
                {audit?.pitchAngle && (
                  <div style={{ background: theme.accentLight, border: `0.5px solid ${theme.accentMid}`, borderRadius: 10, padding: '16px 20px' }}>
                    <div style={monoLabel(theme, true)}>Pitch Angle · Use as email subject</div>
                    <div style={{ fontSize: 15, color: theme.ink, lineHeight: 1.6, marginTop: 8, fontStyle: 'italic' }}>
                      "{audit.pitchAngle}"
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(audit.pitchAngle)}
                      style={{ ...btnGhost(theme), marginTop: 12, fontSize: 11 }}
                    >
                      <i className="ti ti-copy" style={{ fontSize: 12 }} /> Copy
                    </button>
                  </div>
                )}

                {/* Deliverables */}
                <div>
                  <div style={monoLabel(theme)}>What's in the pitch deck (PDF)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                    {[
                      ['Cover page', 'Name, cuisine, hero image, pitch angle'],
                      ['Brand Audit', 'Assessment, rebrand direction, palette'],
                      ['Visual Assets', 'AI-generated food photography'],
                      ['Proposal', 'Deliverables list + call to action'],
                    ].map(([title, desc]) => (
                      <div key={title} style={{ background: theme.surfaceAlt, border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: theme.ink, marginBottom: 3 }}>{title}</div>
                        <div style={{ fontSize: 11, color: theme.inkMuted, lineHeight: 1.5 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Initial state - no audit */}
            {stage === STAGE.IDLE && !hasImages && !restaurant.audit && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 12, textAlign: 'center' }}>
                <i className="ti ti-wand" style={{ fontSize: 28, color: theme.emptyIconColor }} aria-hidden="true" />
                <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>Run audit first</div>
                <div style={{ fontSize: 12, color: theme.inkMuted, maxWidth: 320, lineHeight: 1.6 }}>
                  The deck needs an audit to generate brand direction and image prompts. Go to Prospects, select this restaurant, and run the audit.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DeckSection({ theme, label, text }) {
  return (
    <div style={{ background: theme.surfaceAlt, border: `0.5px solid ${theme.border}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={monoLabel(theme)}>{label}</div>
      <div style={{ fontSize: 12, color: theme.ink, lineHeight: 1.65, marginTop: 7 }}>{text || '—'}</div>
    </div>
  );
}

function monoLabel(theme, accent = false) {
  return {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: accent ? theme.accent : theme.inkMuted,
  };
}

function btnGhost(theme) {
  return { fontFamily: "'DM Sans',sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: `0.5px solid ${theme.border}`, color: theme.btnGhostColor };
}
function btnPrimary(theme) {
  return { fontFamily: "'DM Sans',sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: theme.accent, color: '#fff', border: 'none' };
}
