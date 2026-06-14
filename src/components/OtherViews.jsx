import React, { useState } from 'react';
import { useKeys } from '../context/KeysContext';
import { COUNTRIES, getStates, getCities, getCountryCode } from '../data/locations';
import DeckModal from './DeckModal';

/* ─── shared primitives ───────────────────────────────────────────────── */

function Topbar({ title, meta }) {
  return (
    <div style={sh.topbar}>
      <div style={sh.topTitle}>{title}</div>
      {meta && <div style={sh.topMeta}>{meta}</div>}
    </div>
  );
}

function EmptyState({ icon, title, desc, cta, onCta }) {
  return (
    <div style={sh.empty}>
      <i className={`ti ${icon}`} style={{ fontSize: 28, color: '#2a2a2a', marginBottom: 16 }} />
      <div style={sh.emptyTitle}>{title}</div>
      <div style={sh.emptyDesc}>{desc}</div>
      {cta && <button style={{ ...sh.btnGold, marginTop: 20 }} onClick={onCta}>{cta}</button>}
    </div>
  );
}

function MonoLabel({ children, accent }) {
  return (
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent ? '#c8b99a' : '#5c5751', marginBottom: 6 }}>
      {children}
    </div>
  );
}

function AuditBlock({ label, text, accent }) {
  return (
    <div style={{ background: accent ? '#1a1710' : '#0e0e0e', border: `1px solid ${accent ? '#2e2616' : '#2a2a2a'}`, borderRadius: 8, padding: '12px 16px' }}>
      <MonoLabel accent={accent}>{label}</MonoLabel>
      <div style={{ fontSize: 13, color: '#f0ece4', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{text}</div>
    </div>
  );
}

/* ─── AuditQueueView ──────────────────────────────────────────────────── */

export function AuditQueueView({ restaurants, auditing, auditStatus }) {
  const inProgress = restaurants.filter(r => r.status === 'auditing');
  const audited    = restaurants.filter(r => r.audit);

  if (!inProgress.length && !audited.length) {
    return <EmptyState icon="ti-wand" title="Audit queue is empty" desc="Select restaurants from Prospects and click Run Audit to begin." />;
  }

  return (
    <div style={sh.view}>
      <Topbar
        title="Audit Queue"
        meta={auditing
          ? <span style={{ color: '#c8b99a' }}>{auditStatus}</span>
          : `${audited.length} audited · ${inProgress.length} pending`
        }
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {inProgress.map(r => (
          <div key={r.id} style={sh.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={sh.cardTitle}>{r.name}</div>
                <div style={sh.cardMeta}>{r.cuisine} · {r.area}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="ti ti-loader-2" style={{ fontSize: 13, color: '#f2994a' }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#f2994a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Auditing</span>
              </div>
            </div>
          </div>
        ))}

        {audited.map(r => (
          <div key={r.id} style={sh.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={sh.cardTitle}>{r.name}</div>
                <div style={sh.cardMeta}>{r.cuisine} · {r.area}</div>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#c8b99a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Audited</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AuditBlock label="Brand assessment"  text={r.audit.brandAssessment} />
              <AuditBlock label="Rebrand direction" text={r.audit.rebrandDirection} />
              <AuditBlock label="Pitch angle"       text={r.audit.pitchAngle} accent />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── DecksView ───────────────────────────────────────────────────────── */

export function DecksView({ restaurants, onUpdateRestaurant }) {
  const [activeDeck, setActiveDeck] = useState(null);
  const deckReady = restaurants.filter(r => ['audited','mocked','sent','replied'].includes(r.status));

  if (!deckReady.length) {
    return <EmptyState icon="ti-file-description" title="No decks yet" desc="Run Audit on your prospects first. Once audited, you can generate a pitch deck with AI visuals and download it as a PDF." />;
  }

  return (
    <div style={sh.view}>
      <Topbar title="Decks" meta={`${deckReady.length} ${deckReady.length === 1 ? 'deck' : 'decks'} ready`} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {deckReady.map(r => (
          <div key={r.id} style={{ ...sh.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={sh.cardTitle}>{r.name}</div>
                {r.deckImages?.length > 0 && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#6fcf97', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Images ready
                  </span>
                )}
              </div>
              <div style={sh.cardMeta}>{r.cuisine} · {r.area}</div>
              {r.audit?.pitchAngle && (
                <div style={{ fontSize: 12, color: '#9a9489', marginTop: 6, fontStyle: 'italic', maxWidth: 480, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{r.audit.pitchAngle}"
                </div>
              )}
            </div>
            <button onClick={() => setActiveDeck(r)} style={{ ...sh.btnGold, marginLeft: 16, whiteSpace: 'nowrap', gap: 6 }}>
              <i className="ti ti-presentation" style={{ fontSize: 13 }} />
              View deck
            </button>
          </div>
        ))}
      </div>

      {activeDeck && (
        <DeckModal
          restaurant={restaurants.find(r => r.id === activeDeck.id) || activeDeck}
          onClose={() => setActiveDeck(null)}
          onUpdateRestaurant={onUpdateRestaurant}
        />
      )}
    </div>
  );
}

/* ─── SentView ────────────────────────────────────────────────────────── */

export function SentView({ restaurants }) {
  const sent = restaurants.filter(r => ['sent','replied'].includes(r.status));
  if (!sent.length) {
    return <EmptyState icon="ti-send" title="No emails sent yet" desc="Approve a deck and send the outreach email directly from MESA." />;
  }
  return (
    <div style={sh.view}>
      <Topbar title="Sent" meta={`${sent.length} outreach ${sent.length === 1 ? 'email' : 'emails'} sent`} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sent.map(r => (
          <div key={r.id} style={{ ...sh.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
            <div>
              <div style={sh.cardTitle}>{r.name}</div>
              {r.notes && <div style={{ fontSize: 11, color: '#5c5751', marginTop: 3 }}>{r.notes}</div>}
            </div>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: r.status === 'replied' ? '#c8b99a' : '#5c5751',
            }}>
              {r.status === 'replied' ? 'Replied' : 'Sent'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SettingsView ────────────────────────────────────────────────────── */

export function SettingsView() {
  const { keys, saveKeys } = useKeys();
  const [form, setForm]   = useState({ ...keys });
  const [saved, setSaved] = useState(false);

  const states = getStates(form.country);
  const cities = getCities(form.country, form.state);

  const set = (field, val) => { setForm(p => ({ ...p, [field]: val })); setSaved(false); };

  const handleCountryChange = (c) => setForm(p => ({ ...p, country: c, countryCode: getCountryCode(c), state: '', city: '' }));
  const handleStateChange   = (st) => setForm(p => ({ ...p, state: st, city: '' }));

  const handleSave = () => { saveKeys(form); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Sel = ({ value, onChange, options, placeholder, disabled }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        ...sh.input,
        color: value ? '#f0ece4' : '#5c5751',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const API_FIELDS = [
    { key: 'anthropicKey', label: 'Anthropic API Key', placeholder: 'sk-ant-...' },
    { key: 'openaiKey',    label: 'OpenAI API Key',    placeholder: 'sk-...' },
    { key: 'apifyToken',   label: 'Apify API Token',   placeholder: 'apify_api_...' },
  ];

  return (
    <div style={sh.view}>
      <Topbar title="Settings" meta="API keys and location — saved to this browser only" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        <div style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Location */}
          <section>
            <MonoLabel>Target Location</MonoLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={sh.fieldLabel}>Country</label>
                <Sel value={form.country} onChange={handleCountryChange} options={COUNTRIES} placeholder="Select country" />
              </div>
              <div>
                <label style={sh.fieldLabel}>State / Region <span style={{ color: '#3d3d3d' }}>(optional)</span></label>
                <Sel value={form.state} onChange={handleStateChange} options={states} placeholder={form.country ? 'Select state' : 'Select country first'} disabled={!form.country} />
              </div>
              <div>
                <label style={sh.fieldLabel}>City <span style={{ color: '#3d3d3d' }}>(optional)</span></label>
                <Sel value={form.city} onChange={v => set('city', v)} options={cities} placeholder={form.state ? 'Select city' : 'Select state first'} disabled={!form.state} />
              </div>
              <div style={{ fontSize: 11, color: '#5c5751', background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-map-pin" style={{ fontSize: 12, color: '#c8b99a' }} />
                <span>Searching: <span style={{ color: '#f0ece4' }}>{[form.city, form.state, form.country].filter(Boolean).join(', ') || 'Nothing selected'}</span></span>
              </div>
            </div>
          </section>

          {/* API Keys */}
          <section>
            <MonoLabel>API Keys</MonoLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {API_FIELDS.map(f => (
                <div key={f.key}>
                  <label style={sh.fieldLabel}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      placeholder={f.placeholder}
                      value={form[f.key] || ''}
                      onChange={e => set(f.key, e.target.value)}
                      autoComplete="off"
                      style={{ ...sh.input, paddingRight: form[f.key] ? 32 : 12 }}
                    />
                    {form[f.key] && (
                      <i className="ti ti-check" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#6fcf97' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button onClick={handleSave} style={{ ...sh.btnGold, alignSelf: 'flex-start', gap: 6 }}>
            <i className={`ti ${saved ? 'ti-check' : 'ti-device-floppy'}`} style={{ fontSize: 13 }} />
            {saved ? 'Saved' : 'Save settings'}
          </button>

          <div style={{ fontSize: 11, color: '#3d3d3d', display: 'flex', alignItems: 'center', gap: 5 }}>
            <i className="ti ti-lock" style={{ fontSize: 11 }} />
            Keys are stored in localStorage on this device only.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── shared styles ───────────────────────────────────────────────────── */
const sh = {
  view:      { display: 'flex', flexDirection: 'column', height: '100%', background: '#0e0e0e' },
  topbar:    { background: '#151515', borderBottom: '1px solid #2a2a2a', padding: '18px 24px', flexShrink: 0 },
  topTitle:  { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 500, color: '#f0ece4' },
  topMeta:   { fontSize: 12, color: '#5c5751', marginTop: 2, fontFamily: "'DM Sans', sans-serif" },
  card:      { background: '#151515', border: '1px solid #2a2a2a', borderRadius: 10, padding: 18 },
  cardTitle: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#f0ece4' },
  cardMeta:  { fontSize: 11, color: '#5c5751', marginTop: 2, fontFamily: "'DM Sans', sans-serif" },
  empty:     { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, textAlign: 'center' },
  emptyTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 500, color: '#f0ece4', marginBottom: 8 },
  emptyDesc:  { fontSize: 13, color: '#5c5751', maxWidth: 340, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" },
  fieldLabel: { display: 'block', fontSize: 12, color: '#9a9489', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" },
  input:     { fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: '9px 12px', border: '1px solid #2a2a2a', borderRadius: 6, background: '#0e0e0e', color: '#f0ece4', outline: 'none', width: '100%', transition: 'border-color 0.15s' },
  btnGhost:  { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '8px 14px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #2a2a2a', color: '#9a9489' },
  btnGold:   { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '8px 16px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, background: '#c8b99a', color: '#0e0e0e', border: 'none', fontWeight: 500 },
};
