import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BtnGold, BtnGhost, MonoLabel, AuditBlock } from './DesignSystem';
import { generateDeckImages } from '../utils/imageGen';
import { generateDeckPDF } from '../utils/pdfGen';
import { loadDeckImages, saveDeckImages } from '../lib/auth';

const ST = { IDLE: 'idle', GEN: 'generating', READY: 'ready', ERR: 'error' };

export default function DeckModal({ restaurant, onClose, onUpdateRestaurant, userId }) {
  const { openaiKey, anthropicKey } = useAuth();
  const [stage,    setStage]   = useState(ST.IDLE);
  const [images,   setImages]  = useState([]);
  const [progress, setProgress] = useState('');
  const [error,    setError]   = useState(null);
  const [pdfBusy,  setPdfBusy] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const hasImages = images.length > 0;
  const audit = restaurant.audit;
  const hexes = (audit?.rebrandDirection || '').match(/#[0-9A-Fa-f]{6}/g) || [];

  // Load images from Supabase on mount
  useEffect(() => {
    const uid = userId || (typeof onUpdateRestaurant === 'function' ? null : null);
    loadDeckImages(userId, restaurant.id)
      .then(imgs => {
        if (imgs && imgs.length > 0) {
          setImages(imgs);
          setStage(ST.READY);
        } else if (audit) {
          handleGenerate();
        }
      })
      .catch(() => { if (audit) handleGenerate(); })
      .finally(() => setImgLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!openaiKey || !anthropicKey) { setError('OpenAI and Anthropic API keys required — check Settings.'); setStage(ST.ERR); return; }
    setStage(ST.GEN); setError(null);
    try {
      const imgs = await generateDeckImages(restaurant, openaiKey, anthropicKey, (msg) => setProgress(msg));
      setImages(imgs); setStage(ST.READY); setProgress('');
      // Save to Supabase — no localStorage quota issues
      if (userId) {
        await saveDeckImages(userId, restaurant.id, imgs[0], imgs[1]).catch(console.error);
      }
      onUpdateRestaurant(restaurant.id, { status: 'mocked', hasDeckImages: true });
    } catch (err) { setError(err.message); setStage(ST.ERR); setProgress(''); }
  };

  const handlePDF = async () => {
    setPdfBusy(true);
    try {
      await generateDeckPDF(restaurant, images);
    } catch (e) {
      alert('PDF generation failed: ' + e.message + '\n\nMake sure the function has a 60s timeout set in Vercel.');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200 }} className="fade-in" />
      <div style={s.modal} className="scale-in">
        {/* Header */}
        <div style={s.hdr}>
          <div>
            <div style={s.name}>{restaurant.name}</div>
            <div style={s.meta}>{restaurant.cuisine} · {restaurant.area}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {hasImages && <BtnGhost onClick={handleGenerate}><RefreshIcon /> Regenerate</BtnGhost>}
            <BtnGold onClick={handlePDF} disabled={!hasImages || pdfBusy}>
              {pdfBusy ? <SpinIcon /> : <DownloadIcon />}
              {pdfBusy ? 'Generating PDF...' : 'Download PDF'}
            </BtnGold>
            <BtnGhost onClick={onClose} style={{ padding: '8px 10px' }}><CloseIcon /></BtnGhost>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>
          {stage === ST.GEN && (
            <div style={s.center} className="fade-in">
              <div style={{ width: 52, height: 52, marginBottom: 20, position: 'relative' }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="22" stroke="#2a2a2a" strokeWidth="2"/>
                  <circle cx="26" cy="26" r="22" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"
                    strokeDasharray="36 102" style={{ transformOrigin: 'center', animation: 'spin 1.2s linear infinite' }}/>
                </svg>
              </div>
              <div style={s.centerTitle}>Generating visual assets</div>
              <div style={{ fontSize: 12, color: '#9a9489', marginTop: 4 }}>{progress}</div>
              <div style={{ fontSize: 11, color: '#5c5751', maxWidth: 280, textAlign: 'center', lineHeight: 1.7, marginTop: 12 }}>
                GPT-4o generating food photography from the audit direction. 20–40 seconds.
              </div>
            </div>
          )}

          {stage === ST.ERR && (
            <div style={s.center}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a0a0a', border: '1px solid #3d1515', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eb5757" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
              </div>
              <div style={s.centerTitle}>Image generation failed</div>
              <div style={{ fontSize: 12, color: '#eb5757', maxWidth: 320, textAlign: 'center', marginBottom: 20 }}>{error}</div>
              <BtnGold onClick={handleGenerate}>Try again</BtnGold>
            </div>
          )}

          {stage === ST.IDLE && !hasImages && !audit && (
            <div style={s.center}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a1710', border: '1px solid #2e2616', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8b99a" strokeWidth="1.5" strokeLinecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              </div>
              <div style={s.centerTitle}>Run audit first</div>
              <div style={{ fontSize: 13, color: '#5c5751', maxWidth: 280, textAlign: 'center', lineHeight: 1.7 }}>The deck needs an audit to generate brand direction and image prompts.</div>
            </div>
          )}

          {(stage === ST.READY || hasImages) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="view-enter">
              {/* Images */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #2a2a2a', aspectRatio: '1', background: '#0e0e0e' }}>
                    <img src={`data:image/png;base64,${img}`} alt={`Visual ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                      onMouseEnter={e => e.target.style.transform='scale(1.03)'}
                      onMouseLeave={e => e.target.style.transform='scale(1)'}
                    />
                  </div>
                ))}
              </div>

              {/* Palette */}
              {hexes.length > 0 && (
                <div>
                  <MonoLabel>Proposed Palette</MonoLabel>
                  <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    {hexes.slice(0, 4).map((hex, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 6, background: hex, border: '1px solid #2a2a2a', cursor: 'pointer', transition: 'transform 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
                          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                          onClick={() => navigator.clipboard.writeText(hex)}
                          title={`Copy ${hex}`}
                        />
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#5c5751' }}>{hex.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <AuditBlock label="Brand Assessment"  text={audit?.brandAssessment} />
                <AuditBlock label="Rebrand Direction" text={audit?.rebrandDirection} />
              </div>

              {audit?.pitchAngle && (
                <div style={{ background: '#1a1710', border: '1px solid #2e2616', borderRadius: 10, padding: '16px 18px' }}>
                  <MonoLabel accent>Pitch Angle · Use as email subject</MonoLabel>
                  <div style={{ fontSize: 15, color: '#f0ece4', lineHeight: 1.6, fontStyle: 'italic', marginTop: 6 }}>
                    "{audit.pitchAngle}"
                  </div>
                  <BtnGhost onClick={() => navigator.clipboard.writeText(audit.pitchAngle)} style={{ marginTop: 12, fontSize: 11 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    Copy
                  </BtnGhost>
                </div>
              )}

              <div>
                <MonoLabel>PDF deck includes</MonoLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                  {[['Cover','Name, hero image, pitch angle'],['Audit','Assessment, direction, palette'],['Visuals','AI food photography'],['Proposal','Deliverables + call to action']].map(([t,d]) => (
                    <div key={t} style={{ background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#f0ece4', marginBottom: 3 }}>{t}</div>
                      <div style={{ fontSize: 11, color: '#5c5751', lineHeight: 1.5 }}>{d}</div>
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

const RefreshIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>;
const DownloadIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>;
const CloseIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const SpinIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;

const s = {
  modal:       { position: 'fixed', top: '4vh', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 840, maxHeight: '92vh', background: '#151515', borderRadius: 14, border: '1px solid #2a2a2a', zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' },
  hdr:         { padding: '18px 22px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  name:        { fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 500, color: '#f0ece4' },
  meta:        { fontSize: 11, color: '#5c5751', marginTop: 2 },
  body:        { flex: 1, overflowY: 'auto', padding: 22 },
  center:      { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, textAlign: 'center', padding: 48 },
  centerTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 500, color: '#f0ece4' },
};
