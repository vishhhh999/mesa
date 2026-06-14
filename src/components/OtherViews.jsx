import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, getStates, getCities } from '../data/locations';
import { INDUSTRIES, INDUSTRY_KEYS } from '../data/industries';
import { BtnGold, BtnGhost, EmptyState, MonoLabel, AuditBlock, StatusTag, Select } from './DesignSystem';
import ViewHeader from './ViewHeader';
import DeckModal from './DeckModal';
import OutreachModal from './OutreachModal';

/* ── AuditQueueView ───────────────────────────────────────────── */
export function AuditQueueView({ restaurants, auditing, auditStatus }) {
  const inProgress = restaurants.filter(r => r.status === 'auditing');
  const audited    = restaurants.filter(r => r.audit);

  if (!inProgress.length && !audited.length) {
    return (
      <div style={s.view} className="view-enter">
        <ViewHeader title="Audit Queue" meta="No audits yet" />
        <EmptyState title="Audit queue is empty" desc="Select prospects and click Run Audit to begin." />
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
        {inProgress.map(r => (
          <div key={r.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="stagger-item">
            <div>
              <div style={s.cardName}>{r.name}</div>
              <div style={s.cardMeta}>{r.cuisine} · {r.area}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f2994a" strokeWidth="1.5" strokeLinecap="round" className="spin">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#f2994a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Auditing</span>
            </div>
          </div>
        ))}
        {audited.map(r => (
          <div key={r.id} style={s.card} className="stagger-item">
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

/* ── DecksView ────────────────────────────────────────────────── */
export function DecksView({ restaurants, onUpdateRestaurant, userId }) {
  const [activeDeck,     setActiveDeck]     = useState(null);
  const [activeOutreach, setActiveOutreach] = useState(null);
  const { industry }                        = useAuth();
  const ready = restaurants.filter(r => ['audited','mocked','sent','replied'].includes(r.status));

  const handleApprove = (id) => onUpdateRestaurant(id, { status: 'sent', notes: `Sent ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` });
  const handleReject  = (id) => onUpdateRestaurant(id, { status: 'new', audit: null, hasDeckImages: false });

  return (
    <div style={s.view} className="view-enter">
      <ViewHeader title="Decks" meta={ready.length ? `${ready.length} ${ready.length === 1 ? 'deck' : 'decks'} ready` : 'No decks yet'} />
      {!ready.length ? (
        <EmptyState title="No decks yet" desc="Run Audit on prospects first, then generate pitch decks with AI visuals." />
      ) : (
        <div style={s.scroll}>
          {ready.map((r, i) => (
            <div key={r.id} style={{ ...s.deckCard, animationDelay: `${i * 50}ms` }} className="stagger-item">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={s.cardName}>{r.name}</div>
                  <StatusTag status={r.status} />
                  {r.hasDeckImages && (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#6fcf97', letterSpacing: '0.08em', textTransform: 'uppercase' }}>✓ Images</span>
                  )}
                </div>
                <div style={s.cardMeta}>{r.cuisine || r.area} · {r.area}</div>
                {r.audit?.pitchAngle && (
                  <div style={{ fontSize: 11, color: '#9a9489', marginTop: 6, fontStyle: 'italic', lineHeight: 1.5, maxWidth: 480, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{r.audit.pitchAngle}"
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 20, flexShrink: 0 }}>
                <BtnGhost onClick={() => setActiveDeck(r)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  Deck
                </BtnGhost>
                <BtnGold onClick={() => setActiveOutreach(r)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  Send
                </BtnGold>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeDeck && (
        <DeckModal
          restaurant={restaurants.find(r => r.id === activeDeck.id) || activeDeck}
          onClose={() => setActiveDeck(null)}
          onUpdateRestaurant={onUpdateRestaurant}
          userId={userId}
        />
      )}
      {activeOutreach && (
        <OutreachModal
          restaurant={restaurants.find(r => r.id === activeOutreach.id) || activeOutreach}
          onClose={() => setActiveOutreach(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

/* ── SentView ─────────────────────────────────────────────────── */
export function SentView({ restaurants }) {
  const sent = restaurants.filter(r => ['sent','replied'].includes(r.status));
  return (
    <div style={s.view} className="view-enter">
      <ViewHeader title="Sent" meta={sent.length ? `${sent.length} outreach ${sent.length === 1 ? 'email' : 'emails'} sent` : 'No emails sent yet'} />
      {!sent.length ? (
        <EmptyState title="No emails sent yet" desc="Generate a deck and click Send to draft the outreach email." />
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

/* ── SettingsView ─────────────────────────────────────────────── */
export function SettingsView() {
  const { settings, updateSettings, logout } = useAuth();
  const [form,  setForm]  = useState({
    openai_key:  settings?.openai_key  || '',
    apify_token: settings?.apify_token || '',
    country:     settings?.country     || 'India',
    state:       settings?.state       || '',
    city:        settings?.city        || '',
    industry:    settings?.industry    || 'restaurants',
  });
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);

  const states = getStates(form.country);
  const cities = getCities(form.country, form.state);

  const set  = (field, val) => { setForm(p => ({ ...p, [field]: val })); setSaved(false); };
  const handleCountryChange = c  => setForm(p => ({ ...p, country: c, state: '', city: '' }));
  const handleStateChange   = st => setForm(p => ({ ...p, state: st, city: '' }));

  const handleSave = async () => {
    setSaving(true);
    await updateSettings(form);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={s.view} className="view-enter">
      <ViewHeader
        title="Settings"
        meta="Synced across devices via Supabase"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnGhost onClick={logout} style={{ color: '#eb5757', borderColor: '#2a2a2a', fontSize: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Sign out
            </BtnGhost>
            <BtnGold onClick={handleSave} disabled={saving}>
              {saved
                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg> Saved</>
                : saving
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Saving...</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save</>
              }
            </BtnGold>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={s.settingsGrid}>

          {/* ── Industry ── */}
          <SettingsSection label="Industry" desc="Changes what MESA scrapes and how audits are framed. Each industry + location combination keeps its own prospect list.">
            <div style={s.industryGrid}>
              {INDUSTRY_KEYS.map(key => {
                const ind = INDUSTRIES[key];
                const active = form.industry === key;
                return (
                  <button
                    key={key}
                    onClick={() => set('industry', key)}
                    style={{
                      ...s.industryBtn,
                      background:   active ? '#1a1710' : '#0e0e0e',
                      border:       `1px solid ${active ? '#c8b99a' : '#2a2a2a'}`,
                      color:        active ? '#c8b99a' : '#9a9489',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: active ? 500 : 400, marginBottom: 2 }}>{ind.label}</div>
                  </button>
                );
              })}
            </div>
            {form.industry && (
              <div style={s.industryPreview}>
                <span style={{ color: '#c8b99a', marginRight: 6, fontSize: 10 }}>→</span>
                Scraping: <span style={{ color: '#f0ece4' }}>{INDUSTRIES[form.industry]?.searchPrefix} [city]</span>
              </div>
            )}
          </SettingsSection>

          {/* ── Location ── */}
          <SettingsSection label="Target Location" desc="Switching location loads a separate prospect list. You can have different cities scraped simultaneously.">
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
              <div style={s.locationPreview}>
                <span style={{ color: '#c8b99a', fontSize: 10, marginRight: 6 }}>◎</span>
                Active search: <span style={{ color: '#f0ece4', marginLeft: 4 }}>{[form.city, form.state, form.country].filter(Boolean).join(', ') || 'Nothing selected'}</span>
              </div>
            </div>
          </SettingsSection>

          {/* ── API Keys ── */}
          <SettingsSection label="API Keys" desc="Keys are encrypted at rest in Supabase and synced across your devices. Your Anthropic key was verified at login.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ApiKeyField
                label="OpenAI API Key"
                placeholder="sk-..."
                value={form.openai_key}
                onChange={v => set('openai_key', v)}
                hint="Used for gpt-image-2 image generation in decks."
              />
              <ApiKeyField
                label="Apify API Token"
                placeholder="apify_api_..."
                value={form.apify_token}
                onChange={v => set('apify_token', v)}
                hint="Used for Google Maps scraping. Free tier is fine."
              />
              <div style={s.verifiedKey}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6fcf97" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Anthropic key — verified at login and secured.
              </div>
            </div>
          </SettingsSection>

        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────── */

function SettingsSection({ label, desc, children }) {
  return (
    <div style={s.settingsSection}>
      <div style={s.sectionHdr}>
        <div style={s.sectionLabel}>{label}</div>
        {desc && <div style={s.sectionDesc}>{desc}</div>}
      </div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  );
}

function ApiKeyField({ label, placeholder, value, onChange, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={s.fieldLabel}>
        {label}
        {value && <span style={{ color: '#6fcf97', marginLeft: 6 }}>✓</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          style={s.keyInput}
          onFocus={e => { e.target.style.borderColor = '#c8b99a'; }}
          onBlur={e => { e.target.style.borderColor = '#2a2a2a'; }}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          style={s.showToggle}
          tabIndex={-1}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={show ? '#c8b99a' : '#5c5751'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {show
              ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
              : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
            }
          </svg>
        </button>
      </div>
      {hint && <div style={{ fontSize: 11, color: '#5c5751', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

/* ── Shared styles ────────────────────────────────────────────── */
const s = {
  view:     { display: 'flex', flexDirection: 'column', height: '100%', background: '#0e0e0e' },
  scroll:   { flex: 1, overflowY: 'auto', padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 8 },
  card:     { background: '#151515', border: '1px solid #2a2a2a', borderRadius: 10, padding: 20 },
  deckCard: { background: '#151515', border: '1px solid #2a2a2a', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center' },
  cardName: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#f0ece4' },
  cardMeta: { fontSize: 11, color: '#5c5751', marginTop: 2 },

  // Settings
  settingsGrid:    { display: 'flex', flexDirection: 'column', gap: 0 },
  settingsSection: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, padding: '28px 32px', borderBottom: '1px solid #1c1c1c' },
  sectionHdr:      { paddingRight: 16 },
  sectionLabel:    { fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 500, color: '#f0ece4', marginBottom: 6 },
  sectionDesc:     { fontSize: 12, color: '#5c5751', lineHeight: 1.65 },
  sectionBody:     { maxWidth: 400 },
  fieldLabel:      { display: 'block', fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5c5751', marginBottom: 6 },
  keyInput:        { width: '100%', padding: '9px 36px 9px 12px', background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0ece4', fontSize: 13, fontFamily: "'DM Mono', monospace", outline: 'none', letterSpacing: '0.04em', transition: 'border-color 0.15s' },
  showToggle:      { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  verifiedKey:     { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#5c5751', background: '#0d150d', border: '1px solid #1a2e1a', borderRadius: 6, padding: '8px 12px' },
  locationPreview: { fontSize: 11, color: '#5c5751', background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, padding: '8px 12px', display: 'flex', alignItems: 'center' },
  industryGrid:    { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 },
  industryBtn:     { fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '9px 12px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  industryPreview: { marginTop: 8, fontSize: 11, color: '#5c5751', background: '#0e0e0e', border: '1px solid #2a2a2a', borderRadius: 6, padding: '7px 12px', display: 'flex', alignItems: 'center' },
};
