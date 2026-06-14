import React, { useState } from 'react';

const STEPS = [
  {
    id: 'welcome',
    icon: 'ti-map-pin',
    title: 'Welcome to MESA',
    body: 'MESA is your outreach studio for landing restaurant rebrand clients. It scrapes Google Maps, audits brand weaknesses with AI, generates pitch decks, and helps you close retainers.',
    cta: 'Get started',
  },
  {
    id: 'settings',
    icon: 'ti-adjustments-horizontal',
    title: 'Set up your keys',
    body: 'Before anything works, head to Settings and paste your Apify token (for scraping), Anthropic API key (for audits), and OpenAI key (for image generation). Set your target city while you\'re there.',
    cta: 'Understood',
  },
  {
    id: 'scrape',
    icon: 'ti-refresh',
    title: 'Scrape your city',
    body: 'Hit Scrape on the Prospects page to pull restaurants from Google Maps. Takes 1–3 minutes. Once done, scan the list — look for low photo scores and restaurants without websites.',
    cta: 'Got it',
  },
  {
    id: 'audit',
    icon: 'ti-wand',
    title: 'Select and audit',
    body: 'Select the restaurants that look like strong prospects. Hit Run Audit — Claude analyzes each one and returns a brand assessment, rebrand direction, and a pitch angle sentence for your email.',
    cta: 'Got it',
  },
  {
    id: 'deck',
    icon: 'ti-file-description',
    title: 'Generate your deck',
    body: 'Head to Decks and click View Deck on any audited restaurant. GPT-4o generates food photography, MESA assembles the pitch deck, and you download it as a PDF ready to send.',
    cta: 'Let\'s go',
  },
];

export default function Onboarding({ onDone, onGoSettings }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isSettings = step === 1;

  const handleCta = () => {
    if (isLast) { onDone(); return; }
    setStep(s => s + 1);
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 300 }} />
      <div style={s.card}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Step indicator */}
        <div style={s.steps}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ ...s.stepDot, background: i <= step ? '#c8b99a' : '#2a2a2a', width: i === step ? 20 : 6 }} />
          ))}
        </div>

        {/* Icon */}
        <div style={s.iconWrap}>
          <i className={`ti ${current.icon}`} style={{ fontSize: 22, color: '#c8b99a' }} />
        </div>

        {/* Content */}
        <div style={s.title}>{current.title}</div>
        <div style={s.body}>{current.body}</div>

        {/* Actions */}
        <div style={s.actions}>
          {step > 0 && (
            <button style={s.btnGhost} onClick={() => setStep(s => s - 1)}>Back</button>
          )}
          {isSettings && (
            <button style={s.btnGhost} onClick={() => { onGoSettings(); }}>Open Settings</button>
          )}
          <button style={s.btnGold} onClick={handleCta}>
            {isLast ? 'Enter MESA' : current.cta}
            {!isLast && <i className="ti ti-arrow-right" style={{ fontSize: 13, marginLeft: 4 }} />}
          </button>
        </div>

        {/* Skip */}
        <button style={s.skip} onClick={onDone}>Skip intro</button>
      </div>
    </>
  );
}

const s = {
  card: {
    position: 'fixed',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    background: '#151515',
    border: '1px solid #2a2a2a',
    borderRadius: 14,
    padding: '32px 32px 24px',
    zIndex: 301,
    animation: 'fadeUp 0.25s ease',
    boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
  },
  steps: { display: 'flex', gap: 5, alignItems: 'center', marginBottom: 28 },
  stepDot: { height: 4, borderRadius: 2, transition: 'all 0.2s' },
  iconWrap: { width: 44, height: 44, borderRadius: 10, background: '#1a1710', border: '1px solid #2e2616', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:   { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 500, color: '#f0ece4', marginBottom: 10 },
  body:    { fontSize: 13, color: '#9a9489', lineHeight: 1.7, marginBottom: 24, fontFamily: "'DM Sans', sans-serif" },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btnGhost: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '8px 14px', borderRadius: 6, cursor: 'pointer', background: 'transparent', border: '1px solid #2a2a2a', color: '#9a9489', display: 'flex', alignItems: 'center' },
  btnGold:  { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '8px 18px', borderRadius: 6, cursor: 'pointer', background: '#c8b99a', color: '#0e0e0e', border: 'none', fontWeight: 500, display: 'flex', alignItems: 'center' },
  skip:     { fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#3d3d3d', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', marginTop: 16, display: 'block', textAlign: 'center', width: '100%' },
};
