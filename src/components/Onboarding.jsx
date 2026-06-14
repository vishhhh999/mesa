import React, { useState } from 'react';
import { BtnGold, BtnGhost } from './DesignSystem';

const STEPS = [
  { title: 'Welcome to MESA', body: 'Your outreach studio for landing restaurant rebrand clients. Scrape, audit, generate decks, close retainers.', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { title: 'Set up your keys', body: 'Go to Settings and paste your Apify token (scraping), Anthropic key (audits), and OpenAI key (image generation). Set your target city.', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
  { title: 'Scrape your city', body: 'Hit Scrape on Prospects. Pulls restaurants from Google Maps in 1–3 minutes. Look for low photo scores and no websites.', icon: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15' },
  { title: 'Audit and select', body: "Check the ones that look promising. Hit Run Audit — Claude returns a brand assessment, rebrand direction, and a pitch angle sentence.", icon: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7' },
  { title: 'Generate your deck', body: 'Go to Decks → View Deck. GPT-4o generates food photography. Download as PDF, send to the restaurant owner.', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
];

export default function Onboarding({ onDone, onGoSettings }) {
  const [step, setStep] = useState(0);
  const cur    = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 300 }} />
      <div style={s.card} className="scale-in">
        {/* Step track */}
        <div style={s.track}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ height: 2, flex: i === step ? 2 : 1, borderRadius: 1, background: i <= step ? '#c8b99a' : '#2a2a2a', transition: 'flex 0.3s, background 0.3s' }} />
          ))}
        </div>

        {/* Icon */}
        <div style={s.iconWrap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8b99a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d={cur.icon} />
          </svg>
        </div>

        <div style={s.title}>{cur.title}</div>
        <div style={s.body}>{cur.body}</div>

        <div style={s.actions}>
          {step > 0 && <BtnGhost onClick={() => setStep(s => s - 1)}>Back</BtnGhost>}
          {step === 1 && <BtnGhost onClick={onGoSettings}>Open Settings</BtnGhost>}
          <BtnGold onClick={() => isLast ? onDone() : setStep(s => s + 1)} style={{ marginLeft: 'auto' }}>
            {isLast ? 'Enter MESA' : 'Continue'}
            {!isLast && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </BtnGold>
        </div>

        <button style={s.skip} onClick={onDone}>Skip intro</button>
      </div>
    </>
  );
}

const s = {
  card:     { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, background: '#151515', border: '1px solid #2a2a2a', borderRadius: 14, padding: '28px 28px 20px', zIndex: 301, boxShadow: '0 40px 80px rgba(0,0,0,0.7)' },
  track:    { display: 'flex', gap: 4, marginBottom: 28 },
  iconWrap: { width: 40, height: 40, borderRadius: 8, background: '#1a1710', border: '1px solid #2e2616', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title:    { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 500, color: '#f0ece4', marginBottom: 8 },
  body:     { fontSize: 13, color: '#9a9489', lineHeight: 1.7, marginBottom: 24 },
  actions:  { display: 'flex', gap: 8, alignItems: 'center' },
  skip:     { fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#3d3d3d', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 16, display: 'block', width: '100%', textAlign: 'center', padding: 4 },
};
