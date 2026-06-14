import React, { useState } from 'react';
import { useKeys } from '../context/KeysContext';
import { COUNTRIES, getStates, getCities, getCountryCode } from '../data/locations';
import { BtnGold, BtnGhost, EmptyState, MonoLabel, AuditBlock, StatusTag, Input, Select } from './DesignSystem';
import ViewHeader from './ViewHeader';
import DeckModal from './DeckModal';

/* ── AuditQueueView ────────────────────────────────────────────── */
export function AuditQueueView({ restaurants, auditing, auditStatus }) {
  const inProgress = restaurants.filter(r => r.status === 'auditing');
  const audited    = restaurants.filter(r => r.audit);

  if (!inProgress.length && !audited.length) {
    return (
      <div style={s.view} className="view-enter">
        <ViewHeader title="Audit Queue" meta="No audits yet" />
        <EmptyState title="Audit queue is empty" desc="Select restaurants from Prospects and click Run Audit to begin." />
      </div>
    );
  }

  return (
    <div style={s.view} className="view-enter">
      <ViewHeader
        title="Audit Queue"
        meta={auditing
          ? <span style={{ color: '#c8b99a' }}>{auditStatus}</span>
          : `${audited.length} audited · ${inProgress.length} pending`
        }
      />
      <div style={s.scroll}>

        {inProgress.map((r, i) => (
          <div key={r.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="stagger-item" style2={{ animationDelay: `${i * 50}ms` }}>
            <div>
              <div style={s.cardName}>{r.name}</div>
              <div style={s.cardMeta}>{r.cuisine} · {r.area}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f2994a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="spin">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#f2994a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Auditing</span>
            </div>
          </div>
        ))}

        {audited.map((r, i) => (
          <div key={r.id} style={s.card} className="stagger-item" data-delay={i * 60}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={s.cardName}>{r.name}</div>
                <div style={s.cardMeta}>{r.cuisine} · {r.area}</div>
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

/* ── DecksView ─────────────────────────────────────────────────── */
export function DecksView({ restaurants, onUpdateRestaurant }) {
  const [activeDeck, setActiveDeck] = useState(null);
  const ready = restaurants.filter(r => ['audited','mocked','sent','replied'].includes(r.status));

  return (
    <div style={s.view} className="view-enter">
      <ViewHeader title="Decks" meta={ready.length ? `${ready.length} ${ready.length === 1 ? 'deck' : 'decks'} ready` : 'No decks yet'} />

      {!ready.length ? (
        <EmptyState title="No decks yet" desc="Run Audit on your prospects first. Once audited, generate a pitch deck with AI visuals and download as PDF." />
      ) : (
        <div style={s.scroll}>
          {ready.map((r, i) => (
            <div
              key={r.id}
              style={{ ...s.deckCard, animationDelay: `${i * 50}ms` }}
              className="stagger-item hover-lift"
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={s.cardName}>{r.name}</div>
                  {r.deckImages?.length > 0 && (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#6fcf97', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      ✓ Images
                    </span>
                  )}
                </div>
                <div style={s.cardMeta}>{r.cuisine} · {r.area}</div>
                {r.audit?.pitchAngle && (
                  <div style={{ fontSize: 11, color: '#9a9489', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5, maxWidth: 480 }}>
                    "{r.audit.pitchAngle}"
                  </div>
                )}
              </div>
              <BtnGold onClick={() => setActiveDeck(r)} style={{ marginLeft: 20, flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                </svg>
                View deck
              </BtnGold>
            </div>
          ))}
        </div>
      )}

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

/* ── SentView ──────────────────────────────────────────────────── */
export function SentView({ restaurants }) {
  const sent = restaurants.filter(r => ['sent','replied'].includes(r.status));
  return (
    <div style={s.view} className="view-enter">
      <ViewHeader title="Sent" meta={sent.length ? `${sent.length} outreach ${sent.length === 1 ? 'email' : 'emails'} sent` : 'No emails sent yet'} />
      {!sent.length ? (
        <EmptyState title="No emails sent yet" desc="Approve a deck and send the outreach email directly from MESA." />
      ) : (
        <div style={s.scroll}>
          {sent.map((r, i) => (
            <div key={r.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', animationDelay: `${i*50}ms` }} className="stagger-item">
              <div>
                <div style={s.cardName}>{r.name}</div>
                {r.notes && <div style={{ fontSize: 11, color: '#5c5751', marginTop: 2 }}>{r.notes}</div>}
              </div>
              <StatusTag status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── SettingsView ──────────────────────────────────────────────── */
export function SettingsView() {
  const { keys, saveKeys } = useKeys();
  const [form, setForm]    = useState({ ...keys });
  const [saved, setSaved]  = useState(false);

  const states = getStates(form.country);
  const cities = getCities(form.country, form.state);

  const set = (field, val) => { setForm(p => ({ ...p, [field]: val })); setSaved(false); };

  const handleCountryChange = c  => setForm(p => ({ ...p, country: c, countryCode: getCountryCode(c), state: '', city: '' }));
  const handleStateChange   = st => setForm(p => ({ ...p, state: st, city: '' }));

  const handleSave = () => { saveKeys(form); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div style={s.view} className="view-enter">
      <ViewHeader
        title="Settings"
        meta="API keys and location — saved to this browser only"
        actions={
          <BtnGold onClick={handleSave}>
            {saved
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save settings</>
            }
          </BtnGold>
        }
      />
      <div style={s.scroll}>
        <div style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 32 }}>

          <section>
            <MonoLabel>Target Location</MonoLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={s.fieldLabel}>Country</label>
                <Select value={form.country} onChange={handleCountryChange} options={COUNTRIES} placeholder="Select country" />
              </div>
              <div>
                <label style={s.fieldLabel}>State / Region <span style={{ color: '#3d3d3d' }}>(optional)</span></label>
                <Select value={form.state} onChange={handleStateChange} options={states} placeholder={form.country ? 'Select state' : 'Select country first'} disabled={!form.country} />
              </div>
              <div>
                <label style={s.fieldLabel}>City <span style={{ color: '#3d3d3d' }}>(optional)</span></label>
                <Select value={form.city} onChange={v => set('city', v)} options={cities} placeholder={form.state ? 'Select city' : 'Select state first'} disabled={!form.state} />
              </div>
              <div style={{ fontSize: 11, color: '#5c5751', background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#c8b99a', fontSize: 12 }}>◎</span>
                Searching: <span style={{ color: '#f0ece4' }}>{[form.city, form.state, form.country].filter(Boolean).join(', ') || 'Nothing selected'}</span>
              </div>
            </div>
          </section>

          <section>
            <MonoLabel>API Keys</MonoLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'anthropicKey', label: 'Anthropic API Key', placeholder: 'sk-ant-...' },
                { key: 'openaiKey',    label: 'OpenAI API Key',    placeholder: 'sk-...' },
                { key: 'apifyToken',   label: 'Apify API Token',   placeholder: 'apify_api_...' },
              ].map(f => (
                <div key={f.key}>
                  <label style={s.fieldLabel}>
                    {f.label}
                    {form[f.key] && <span style={{ color: '#6fcf97', marginLeft: 6, fontSize: 10 }}>✓</span>}
                  </label>
                  <Input
                    type="password"
                    placeholder={f.placeholder}
                    value={form[f.key] || ''}
                    onChange={v => set(f.key, v)}
                  />
                </div>
              ))}
            </div>
          </section>

          <div style={{ fontSize: 11, color: '#3d3d3d', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Keys stored in localStorage on this device only.
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  view:     { display: 'flex', flexDirection: 'column', height: '100%', background: '#0e0e0e' },
  scroll:   { flex: 1, overflowY: 'auto', padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 8 },
  card:     { background: '#151515', border: '1px solid #2a2a2a', borderRadius: 10, padding: 20, transition: 'border-color 0.15s' },
  deckCard: { background: '#151515', border: '1px solid #2a2a2a', borderRadius: 10, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'default' },
  cardName: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#f0ece4' },
  cardMeta: { fontSize: 11, color: '#5c5751' },
  fieldLabel: { display: 'block', fontSize: 12, color: '#9a9489', marginBottom: 6 },
};
