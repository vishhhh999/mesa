import React, { useState, useEffect } from 'react';
import { useKeys } from '../context/KeysContext';
import { generateDeckImages } from '../utils/imageGen';
import { generateDeckPDF } from '../utils/pdfGen';

const STAGE = { IDLE: 'idle', GENERATING: 'generating', READY: 'ready', ERROR: 'error' };

export default function DeckModal({ restaurant, onClose, onUpdateRestaurant }) {
  const { keys } = useKeys();
  const [stage,          setStage]   = useState(STAGE.IDLE);
  const [images,         setImages]  = useState(restaurant.deckImages || []);
  const [progress,       setProgress] = useState('');
  const [error,          setError]   = useState(null);
  const [pdfGenerating,  setPdfGen]  = useState(false);

  const hasImages = images.length > 0;
  const audit = restaurant.audit;
  const hexMatches = (audit?.rebrandDirection || '').match(/#[0-9A-Fa-f]{6}/g) || [];

  useEffect(() => {
    if (!hasImages && audit) handleGenerate();
  }, []);

  const handleGenerate = async () => {
    if (!keys.openaiKey) { setError('No OpenAI API key. Add it in Settings.'); setStage(STAGE.ERROR); return; }
    setStage(STAGE.GENERATING); setError(null);
    try {
      const imgs = await generateDeckImages(restaurant, keys.openaiKey, (i, total) => setProgress(`Generating image ${i + 1} of ${total}...`));
      setImages(imgs);
      setStage(STAGE.READY);
      setProgress('');
      onUpdateRestaurant(restaurant.id, { deckImages: imgs, status: 'mocked' });
    } catch (err) {
      setError(err.message); setStage(STAGE.ERROR); setProgress('');
    }
  };

  const handleDownloadPDF = async () => {
    setPdfGen(true);
    try {
      const doc = await generateDeckPDF(restaurant, images);
      doc.save(`MESA_${restaurant.name.replace(/\s+/g, '_')}_deck.pdf`);
    } catch (err) {
      alert('PDF generation failed: ' + err.message);
    } finally { setPdfGen(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 200 }} />
      <div style={s.modal}>
        <style>{`@keyframes deckIn { from { transform: scale(0.97) translateY(12px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }`}</style>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.name}>{restaurant.name}</div>
            <div style={s.meta}>{restaurant.cuisine} · {restaurant.area} · Pitch deck</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {hasImages && (
              <button onClick={handleGenerate} style={s.btnGhost}>
                <i className="ti ti-refresh" style={{ fontSize: 13 }} /> Regenerate
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              disabled={!hasImages || pdfGenerating}
              style={{ ...s.btnGold, opacity: !hasImages || pdfGenerating ? 0.4 : 1 }}
            >
              <i className={`ti ${pdfGenerating ? 'ti-loader-2' : 'ti-download'}`} style={{ fontSize: 13 }} />
              {pdfGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            <button onClick={onClose} style={{ ...s.btnGhost, padding: '8px 10px' }}>
              <i className="ti ti-x" style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>

          {/* Generating */}
          {stage === STAGE.GENERATING && (
            <div style={s.center}>
              <i className="ti ti-loader-2" style={{ fontSize: 32, color: '#c8b99a', marginBottom: 16 }} />
              <div style={s.centerTitle}>Generating visual assets</div>
              <div style={s.centerMeta}>{progress}</div>
              <div style={{ fontSize: 11, color: '#5c5751', maxWidth: 300, textAlign: 'center', lineHeight: 1.7, marginTop: 8 }}>
                GPT-4o is generating food photography based on the audit direction. Takes 20–40 seconds.
              </div>
            </div>
          )}

          {/* Error */}
          {stage === STAGE.ERROR && (
            <div style={s.center}>
              <i className="ti ti-alert-circle" style={{ fontSize: 28, color: '#eb5757', marginBottom: 14 }} />
              <div style={s.centerTitle}>Image generation failed</div>
              <div style={{ fontSize: 12, color: '#eb5757', maxWidth: 340, textAlign: 'center', marginBottom: 16 }}>{error}</div>
              <button onClick={handleGenerate} style={s.btnGold}>Try again</button>
            </div>
          )}

          {/* No audit */}
          {stage === STAGE.IDLE && !hasImages && !audit && (
            <div style={s.center}>
              <i className="ti ti-wand" style={{ fontSize: 28, color: '#2a2a2a', marginBottom: 14 }} />
              <div style={s.centerTitle}>Run audit first</div>
              <div style={{ fontSize: 13, color: '#5c5751', maxWidth: 300, textAlign: 'center', lineHeight: 1.7 }}>
                The deck needs an audit to generate brand direction and image prompts.
              </div>
            </div>
          )}

          {/* Deck preview */}
          {(stage === STAGE.READY || hasImages) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Images */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #2a2a2a', aspectRatio: '1', background: '#0e0e0e' }}>
                    <img src={`data:image/png;base64,${img}`} alt={`Brand visual ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>

              {/* Palette */}
              {hexMatches.length > 0 && (
                <div>
                  <div style={s.monoLabel}>Proposed Palette</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    {hexMatches.slice(0, 4).map((hex, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 6, background: hex, border: '1px solid #2a2a2a' }} />
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#5c5751' }}>{hex.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Brand Assessment',  text: audit?.brandAssessment },
                  { label: 'Rebrand Direction', text: audit?.rebrandDirection },
                ].map(({ label, text }) => (
                  <div key={label} style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={s.monoLabel}>{label}</div>
                    <div style={{ fontSize: 12, color: '#f0ece4', lineHeight: 1.65 }}>{text || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Pitch angle */}
              {audit?.pitchAngle && (
                <div style={{ background: '#1a1710', border: '1px solid #2e2616', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ ...s.monoLabel, color: '#c8b99a' }}>Pitch Angle · Use as email subject</div>
                  <div style={{ fontSize: 15, color: '#f0ece4', lineHeight: 1.6, fontStyle: 'italic', marginTop: 8 }}>
                    "{audit.pitchAngle}"
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(audit.pitchAngle)} style={{ ...s.btnGhost, marginTop: 12, fontSize: 11 }}>
                    <i className="ti ti-copy" style={{ fontSize: 12 }} /> Copy
                  </button>
                </div>
              )}

              {/* What's in the PDF */}
              <div>
                <div style={s.monoLabel}>What's in the PDF deck</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  {[
                    ['Cover',    'Name, cuisine, hero image, pitch angle'],
                    ['Audit',    'Assessment, rebrand direction, palette'],
                    ['Visuals',  'AI-generated food photography'],
                    ['Proposal', 'Deliverables + call to action'],
                  ].map(([title, desc]) => (
                    <div key={title} style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#f0ece4', marginBottom: 3 }}>{title}</div>
                      <div style={{ fontSize: 11, color: '#5c5751', lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const s = {
  modal:       { position: 'fixed', top: '4vh', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 840, maxHeight: '92vh', background: '#151515', borderRadius: 14, border: '1px solid #2a2a2a', zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'deckIn 0.22s ease', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' },
  header:      { padding: '18px 22px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  name:        { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 500, color: '#f0ece4' },
  meta:        { fontSize: 11, color: '#5c5751', marginTop: 2, fontFamily: "'DM Sans', sans-serif" },
  body:        { flex: 1, overflowY: 'auto', padding: 22 },
  center:      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center' },
  centerTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 500, color: '#f0ece4', marginBottom: 6 },
  centerMeta:  { fontSize: 12, color: '#9a9489' },
  monoLabel:   { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c5751', marginBottom: 4 },
  btnGhost:    { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '8px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #2a2a2a', color: '#9a9489' },
  btnGold:     { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '8px 16px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: '#c8b99a', color: '#0e0e0e', border: 'none', fontWeight: 500 },
};
