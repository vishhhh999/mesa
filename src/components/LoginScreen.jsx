import React, { useState } from 'react';
import { validateAnthropicKey } from '../lib/auth';
import { useAuth } from '../context/AuthContext';

const STATES = { IDLE: 'idle', VALIDATING: 'validating', ERROR: 'error' };

export default function LoginScreen() {
  const { login } = useAuth();
  const [key,     setKey]     = useState('');
  const [state,   setState]   = useState(STATES.IDLE);
  const [error,   setError]   = useState('');
  const [show,    setShow]    = useState(false);

  const handleSubmit = async () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      setError("That doesn't look like an Anthropic key. It should start with sk-ant-");
      setState(STATES.ERROR);
      return;
    }

    setState(STATES.VALIDATING);
    setError('');

    // Validate key
    const { valid, error: valError } = await validateAnthropicKey(trimmed);
    if (!valid) {
      setError(valError);
      setState(STATES.ERROR);
      return;
    }

    // Login / create account
    try {
      await login(trimmed);
      // AuthContext sets userId → App renders main UI
    } catch (err) {
      setError(err.message);
      setState(STATES.ERROR);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const isValidating = state === STATES.VALIDATING;

  return (
    <div style={s.wrap}>
      {/* Background grid */}
      <div style={s.grid} aria-hidden="true">
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} style={s.cell} />
        ))}
      </div>

      {/* Card */}
      <div style={s.card} className="scale-in">

        {/* Logo */}
        <div style={s.logo}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="6" fill="#c8b99a" opacity="0.15"/>
            <path d="M7 8h14M7 14h10M7 20h6" stroke="#c8b99a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={s.logoText}>MESA</span>
        </div>

        <div style={s.headline}>Enter your Anthropic API key</div>
        <div style={s.sub}>
          Your key validates your identity and powers the AI audit. It's hashed before being stored — never saved in plaintext.
        </div>

        {/* Input */}
        <div style={s.inputWrap}>
          <input
            type={show ? 'text' : 'password'}
            value={key}
            onChange={e => { setKey(e.target.value); setState(STATES.IDLE); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="sk-ant-api03-..."
            style={{
              ...s.input,
              borderColor: state === STATES.ERROR ? '#eb5757' : key.length > 0 ? '#c8b99a' : '#2a2a2a',
            }}
            autoComplete="off"
            autoFocus
            spellCheck={false}
          />
          <button
            style={s.showBtn}
            onClick={() => setShow(v => !v)}
            tabIndex={-1}
            type="button"
            aria-label={show ? 'Hide key' : 'Show key'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={show ? '#c8b99a' : '#5c5751'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {show
                ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
              }
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={s.error} className="fade-in">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#eb5757" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          style={{
            ...s.cta,
            opacity: (!key.trim() || isValidating) ? 0.45 : 1,
            cursor: (!key.trim() || isValidating) ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSubmit}
          disabled={!key.trim() || isValidating}
        >
          {isValidating ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="spin">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Verifying key...
            </>
          ) : (
            <>
              Enter MESA
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </button>

        {/* Footer note */}
        <div style={s.note}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Key verified via Anthropic API, then hashed with SHA-256. Never stored in plaintext.
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    position: 'fixed', inset: 0,
    background: '#0e0e0e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridTemplateRows: 'repeat(10, 1fr)',
    opacity: 0.25,
    pointerEvents: 'none',
  },
  cell: {
    border: '0.5px solid #1c1c1c',
  },
  card: {
    position: 'relative',
    width: 400,
    background: '#151515',
    border: '1px solid #2a2a2a',
    borderRadius: 14,
    padding: '36px 32px 28px',
    boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 28,
  },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 18, fontWeight: 700,
    color: '#f0ece4', letterSpacing: '0.14em',
  },
  headline: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 20, fontWeight: 500,
    color: '#f0ece4', marginBottom: 10, lineHeight: 1.3,
  },
  sub: {
    fontSize: 13, color: '#9a9489',
    lineHeight: 1.65, marginBottom: 24,
  },
  inputWrap: {
    position: 'relative', marginBottom: 12,
  },
  input: {
    width: '100%', padding: '11px 40px 11px 14px',
    background: '#0e0e0e',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    color: '#f0ece4', fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.15s',
    letterSpacing: '0.04em',
  },
  showBtn: {
    position: 'absolute', right: 10, top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: 4,
    display: 'flex', alignItems: 'center',
  },
  error: {
    display: 'flex', alignItems: 'flex-start', gap: 6,
    fontSize: 12, color: '#eb5757', lineHeight: 1.5,
    marginBottom: 12,
  },
  cta: {
    marginTop: 4,
    width: '100%', padding: '12px 0',
    background: '#c8b99a', color: '#0e0e0e',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, fontWeight: 500,
    border: 'none', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'opacity 0.15s, transform 0.1s',
  },
  note: {
    marginTop: 20,
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: '#3d3d3d', lineHeight: 1.5,
  },
};
