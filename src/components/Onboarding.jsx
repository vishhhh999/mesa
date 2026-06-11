import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to MESA',
    body: 'MESA is your restaurant outreach pipeline. It finds restaurants with weak branding, generates mock redesigns using AI, and helps you pitch them a retainer.',
    position: 'center',
    cta: 'Get started',
  },
  {
    id: 'settings',
    title: 'First, add your API keys',
    body: 'Go to Settings in the sidebar and paste your Apify token, Anthropic key, and OpenAI key. They save to your browser only.',
    position: 'center',
    highlight: 'settings',
    cta: 'Got it',
  },
  {
    id: 'scrape',
    title: 'Scrape your city',
    body: 'Hit the Scrape button to pull real restaurants from Google Maps. Takes about 60–90 seconds. Results show up in this table.',
    position: 'center',
    highlight: 'scrape',
    cta: 'Got it',
  },
  {
    id: 'select',
    title: 'Select your prospects',
    body: 'Sort by Photo Score to find restaurants with the weakest visuals — those are your best targets. Select the ones worth pursuing, then hit Run Audit.',
    position: 'center',
    cta: 'Start using MESA',
  },
];

export default function Onboarding({ onDone, onGoSettings }) {
  const [step, setStep] = useState(0);
  const { theme } = useTheme();
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  const handleCta = () => {
    if (isLast) {
      onDone();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Progress bar */}
        <div style={styles.progressBg}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        {/* Step counter */}
        <div style={styles.stepCount}>
          <span style={styles.stepNum}>{step + 1}</span>
          <span style={styles.stepOf}> of {STEPS.length}</span>
        </div>

        {/* Icon */}
        <div style={styles.iconWrap}>
          <i className={`ti ${getIcon(current.id)}`} style={styles.icon} aria-hidden="true" />
        </div>

        {/* Content */}
        <div style={styles.title}>{current.title}</div>
        <div style={styles.body}>{current.body}</div>

        {/* Actions */}
        <div style={styles.actions}>
          {step > 0 && (
            <button style={styles.btnBack} onClick={() => setStep(s => s - 1)}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button style={styles.btnSkip} onClick={onDone}>Skip</button>
          <button style={styles.btnCta} onClick={handleCta}>
            {current.cta}
            {!isLast && <i className="ti ti-arrow-right" style={{ fontSize: 13, marginLeft: 4 }} />}
          </button>
        </div>

        {/* Dot nav */}
        <div style={styles.dots}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{ ...styles.dot, ...(i === step ? styles.dotActive : {}) }}
              onClick={() => setStep(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getIcon(id) {
  switch (id) {
    case 'welcome':  return 'ti-layout-dashboard';
    case 'settings': return 'ti-adjustments-horizontal';
    case 'scrape':   return 'ti-refresh';
    case 'select':   return 'ti-filter';
    default:         return 'ti-info-circle';
  }
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)',
  },
  card: {
    background: 'var(--mesa-surface, #FFFFFF)',
    borderRadius: 16,
    padding: '32px 32px 24px',
    width: 420,
    maxWidth: '90vw',
    boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: '#F0EDE8',
  },
  progressFill: {
    height: '100%',
    background: '#C8522A',
    borderRadius: '0 2px 2px 0',
    transition: 'width 0.3s ease',
  },
  stepCount: {
    marginBottom: 20,
  },
  stepNum: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    color: '#C8522A',
    fontWeight: 500,
  },
  stepOf: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    color: '#B4B0A8',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: '#FDF3EF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 22,
    color: '#C8522A',
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: 20,
    fontWeight: 300,
    color: '#1A1916',
    marginBottom: 10,
    letterSpacing: '-0.3px',
    lineHeight: 1.3,
  },
  body: {
    fontSize: 13,
    color: '#5F5E5A',
    lineHeight: 1.65,
    marginBottom: 28,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  btnBack: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    padding: '8px 14px',
    borderRadius: 8,
    border: '0.5px solid #E4E1D9',
    background: 'transparent',
    color: '#8A8680',
    cursor: 'pointer',
  },
  btnSkip: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#B4B0A8',
    cursor: 'pointer',
  },
  btnCta: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    padding: '9px 18px',
    borderRadius: 8,
    border: 'none',
    background: '#C8522A',
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
  },
  dots: {
    display: 'flex',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#E4E1D9',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dotActive: {
    background: '#C8522A',
    width: 18,
    borderRadius: 3,
  },
};
