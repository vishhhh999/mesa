import React, { useState } from 'react';
import { useKeys } from '../context/KeysContext';
import { useTheme } from '../context/ThemeContext';
import { COUNTRIES, getStates, getCities, getCountryCode } from '../data/locations';

function EmptyView({ icon, title, description, cta, onCta }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' }}>
        <i className={`ti ${icon}`} style={{ fontSize: 28, color: theme.emptyIconColor, marginBottom: 14 }} aria-hidden="true" />
        <div style={{ fontSize: 15, fontWeight: 500, color: theme.ink, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: theme.inkMuted, maxWidth: 360, lineHeight: 1.6 }}>{description}</div>
        {cta && <button style={{ marginTop: 16, fontFamily: "'DM Sans',sans-serif", fontSize: 12, padding: '8px 16px', borderRadius: 8, background: theme.accent, color: '#fff', border: 'none', cursor: 'pointer' }} onClick={onCta}>{cta}</button>}
      </div>
    </div>
  );
}

export function AuditQueueView({ restaurants, onUpdateRestaurant }) {
  const { theme } = useTheme();
  const queued = restaurants.filter(r => r.status === 'auditing' || (r.selected && r.status === 'new'));
  const audited = restaurants.filter(r => r.audit);

  if (queued.length === 0 && audited.length === 0) {
    return <EmptyView icon="ti-wand" title="Audit queue is empty" description="Select restaurants from Prospects and click Run Audit to begin." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={topbarStyle(theme)}>
        <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>Audit Queue</div>
        <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 1 }}>{audited.length} audited · {queued.length} pending</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {restaurants.filter(r => r.audit || r.status === 'auditing').map(r => (
          <div key={r.id} style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: r.audit ? 14 : 0 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>{r.name}</div>
                <div style={{ fontSize: 11, color: theme.inkMuted, marginTop: 2 }}>{r.cuisine} · {r.area}</div>
              </div>
              {r.status === 'auditing' && <span style={tagStyle('#EF9F27', '#FEF3CD')}>Auditing...</span>}
              {r.audit && <span style={tagStyle('#3B6D11', '#E8F4E8')}>Audited</span>}
            </div>
            {r.audit && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AuditSection label="Brand assessment" text={r.audit.brandAssessment} theme={theme} />
                <AuditSection label="Rebrand direction" text={r.audit.rebrandDirection} theme={theme} />
                <AuditSection label="Pitch angle" text={r.audit.pitchAngle} theme={theme} accent />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditSection({ label, text, theme, accent }) {
  return (
    <div style={{ background: accent ? theme.accentLight : theme.surfaceAlt, border: `0.5px solid ${accent ? theme.accentMid : theme.border}`, borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '1.2px', textTransform: 'uppercase', color: accent ? theme.accent : theme.inkMuted, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13, color: theme.ink, lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

export function DecksView({ restaurants, onUpdateRestaurant }) {
  const { theme } = useTheme();
  const deckReady = restaurants.filter(r => r.status === 'mocked' || r.status === 'sent' || r.status === 'replied');

  if (deckReady.length === 0) {
    return <EmptyView icon="ti-file-description" title="No decks generated yet" description="Run Audit on prospects first. Once audited, MESA will generate a PDF pitch deck with mock menu designs and brand direction." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={topbarStyle(theme)}>
        <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>Decks</div>
        <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 1 }}>{deckReady.length} decks ready</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {deckReady.map(r => (
          <div key={r.id} style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: 10, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>{r.name}</div>
              <div style={{ fontSize: 11, color: theme.inkMuted, marginTop: 2 }}>{r.cuisine} · {r.area}</div>
              {r.audit?.pitchAngle && <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 6, maxWidth: 420, lineHeight: 1.5, fontStyle: 'italic' }}>"{r.audit.pitchAngle}"</div>}
            </div>
            <button style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, padding: '7px 14px', borderRadius: 8, background: theme.accent, color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              View deck
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SentView({ restaurants }) {
  const { theme } = useTheme();
  const sent = restaurants.filter(r => r.status === 'sent' || r.status === 'replied');
  if (sent.length === 0) {
    return <EmptyView icon="ti-send" title="No emails sent yet" description="Approve a deck and send the outreach email directly from MESA." />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={topbarStyle(theme)}>
        <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>Sent</div>
        <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 1 }}>{sent.length} outreach emails sent</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sent.map(r => (
          <div key={r.id} style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: theme.ink }}>{r.name}</div>
              <div style={{ fontSize: 11, color: theme.inkMuted, marginTop: 2 }}>{r.notes}</div>
            </div>
            <span style={r.status === 'replied' ? tagStyle('#C8522A', '#F5D8CC') : tagStyle('#185FA5', '#E8EEF8')}>
              {r.status === 'replied' ? 'Replied' : 'Sent'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsView() {
  const { keys, saveKeys } = useKeys();
  const { theme, isDark } = useTheme();
  const [form, setForm] = useState({ ...keys });
  const [saved, setSaved] = useState(false);

  const states = getStates(form.country);
  const cities = getCities(form.country, form.state);

  const handleCountryChange = (country) => {
    setForm(prev => ({ ...prev, country, countryCode: getCountryCode(country), state: '', city: '' }));
    setSaved(false);
  };

  const handleStateChange = (state) => {
    setForm(prev => ({ ...prev, state, city: '' }));
    setSaved(false);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveKeys(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const API_FIELDS = [
    { key: 'anthropicKey', label: 'Anthropic API Key', placeholder: 'sk-ant-...', type: 'password' },
    { key: 'openaiKey',    label: 'OpenAI API Key',    placeholder: 'sk-...',      type: 'password' },
    { key: 'apifyToken',   label: 'Apify API Token',   placeholder: 'apify_api_...', type: 'password' },
  ];

  const sel = (value, onChange, options, placeholder, disabled) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13,
        padding: '9px 12px', border: `0.5px solid ${theme.border}`,
        borderRadius: 8, background: disabled ? theme.surfaceAlt : theme.inputBg,
        color: value ? theme.ink : theme.inkMuted, outline: 'none', width: '100%',
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={topbarStyle(theme)}>
        <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink }}>Settings</div>
        <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 1 }}>API keys and location — saved to this browser only</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Appearance */}
          <div>
            <div style={sectionLabel(theme)}>Appearance</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['light', 'dark'].map(mode => (
                <button
                  key={mode}
                  onClick={() => handleChange('theme', mode)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${form.theme === mode ? theme.accent : theme.border}`,
                    background: form.theme === mode ? theme.accentLight : theme.inputBg,
                    color: form.theme === mode ? theme.accent : theme.inkMuted,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.15s',
                  }}
                >
                  <i className={`ti ${mode === 'dark' ? 'ti-moon' : 'ti-sun'}`} style={{ fontSize: 15 }} />
                  {mode.charAt(0).toUpperCase() + mode.slice(1)} mode
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <div style={sectionLabel(theme)}>Target Location</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={fieldLabel(theme)}>Country</label>
                {sel(form.country, handleCountryChange, COUNTRIES, 'Select country')}
              </div>
              <div>
                <label style={fieldLabel(theme)}>State / Region <span style={{ color: theme.inkFaint }}>(optional)</span></label>
                {sel(form.state, handleStateChange, states, form.country ? 'Select state' : 'Select country first', !form.country)}
              </div>
              <div>
                <label style={fieldLabel(theme)}>City <span style={{ color: theme.inkFaint }}>(optional)</span></label>
                {sel(form.city, (v) => handleChange('city', v), cities, form.state ? 'Select city' : 'Select state first', !form.state)}
              </div>
              <div style={{ fontSize: 11, color: theme.inkMuted, background: theme.surfaceAlt, border: `0.5px solid ${theme.border}`, borderRadius: 6, padding: '8px 10px' }}>
                <i className="ti ti-map-pin" style={{ marginRight: 5, fontSize: 12 }} />
                Searching: <strong style={{ color: theme.ink }}>{[form.city, form.state, form.country].filter(Boolean).join(', ') || 'Nothing selected'}</strong>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div>
            <div style={sectionLabel(theme)}>API Keys</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {API_FIELDS.map(f => (
                <div key={f.key}>
                  <label style={fieldLabel(theme)}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={e => handleChange(f.key, e.target.value)}
                      autoComplete="off"
                      style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, padding: '9px 36px 9px 12px', border: `0.5px solid ${theme.border}`, borderRadius: 8, background: theme.inputBg, color: theme.ink, outline: 'none', width: '100%' }}
                    />
                    {form[f.key] && <i className="ti ti-check" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#639922' }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, padding: '10px 20px', borderRadius: 8, background: saved ? '#639922' : theme.accent, color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
          >
            <i className={`ti ${saved ? 'ti-check' : 'ti-device-floppy'}`} style={{ fontSize: 13 }} />
            {saved ? 'Saved' : 'Save settings'}
          </button>

          <div style={{ fontSize: 11, color: theme.inkFaint, display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-lock" style={{ fontSize: 12 }} />
            Keys are stored in localStorage on this device only.
          </div>
        </div>
      </div>
    </div>
  );
}

function topbarStyle(theme) {
  return { background: theme.surface, borderBottom: `0.5px solid ${theme.border}`, padding: '16px 24px', flexShrink: 0 };
}
function sectionLabel(theme) {
  return { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: theme.inkMuted, marginBottom: 10 };
}
function fieldLabel(theme) {
  return { display: 'block', fontSize: 12, color: theme.inkMuted, fontWeight: 500, marginBottom: 5 };
}
function tagStyle(color, bg) {
  return { fontFamily: "'DM Mono', monospace", fontSize: 10, padding: '3px 8px', borderRadius: 20, background: bg, color, whiteSpace: 'nowrap' };
}
