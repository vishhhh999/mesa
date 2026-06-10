import React from 'react';

function EmptyView({ icon, title, description, cta, onCta }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.inner}>
        <i className={`ti ${icon}`} style={styles.icon} aria-hidden="true" />
        <div style={styles.title}>{title}</div>
        <div style={styles.desc}>{description}</div>
        {cta && (
          <button style={styles.btn} onClick={onCta}>{cta}</button>
        )}
      </div>
    </div>
  );
}

export function AuditQueueView({ restaurants }) {
  const queued = restaurants.filter(r => r.selected && r.status === 'new');
  if (queued.length === 0) {
    return (
      <EmptyView
        icon="ti-wand"
        title="Audit queue is empty"
        description="Select restaurants from Prospects and click Run Audit to begin."
      />
    );
  }
  return (
    <div style={styles.wrap}>
      <div style={styles.topbar}>
        <div style={styles.topTitle}>Audit Queue</div>
        <div style={styles.topMeta}>{queued.length} restaurants queued for audit</div>
      </div>
      <div style={styles.comingSoon}>
        <i className="ti ti-wand" style={{ fontSize: 28, color: '#C8522A', marginBottom: 12 }} />
        <div style={styles.title}>Audit pipeline</div>
        <div style={styles.desc}>Claude will analyze each restaurant's GMB photos, website, and menu to generate a brand audit and rebrand brief. Coming in Step 3.</div>
        <div style={styles.queueList}>
          {queued.map(r => (
            <div key={r.id} style={styles.queueItem}>
              <span style={styles.queueName}>{r.name}</span>
              <span style={styles.queueSub}>{r.cuisine} · {r.area}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DecksView() {
  return (
    <EmptyView
      icon="ti-file-description"
      title="No decks generated yet"
      description="Once audit is complete, MESA will generate a PDF pitch deck per restaurant. Mock menu designs and brand direction included."
    />
  );
}

export function SentView({ restaurants }) {
  const sent = restaurants.filter(r => r.status === 'sent' || r.status === 'replied');
  if (sent.length === 0) {
    return (
      <EmptyView
        icon="ti-send"
        title="No emails sent yet"
        description="Approve a deck and send the outreach email directly from MESA."
      />
    );
  }
  return (
    <div style={styles.wrap}>
      <div style={styles.topbar}>
        <div style={styles.topTitle}>Sent</div>
        <div style={styles.topMeta}>{sent.length} outreach emails sent</div>
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sent.map(r => (
          <div key={r.id} style={styles.sentCard}>
            <div>
              <div style={styles.sentName}>{r.name}</div>
              <div style={styles.sentMeta}>{r.notes}</div>
            </div>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 20,
              background: r.status === 'replied' ? '#F5D8CC' : '#E8EEF8',
              color: r.status === 'replied' ? '#C8522A' : '#185FA5',
            }}>
              {r.status === 'replied' ? 'Replied' : 'Sent'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsView() {
  return (
    <div style={styles.wrap}>
      <div style={styles.topbar}>
        <div style={styles.topTitle}>Settings</div>
        <div style={styles.topMeta}>API keys and pipeline preferences</div>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        {[
          { label: 'Anthropic API Key', placeholder: 'sk-ant-...', type: 'password' },
          { label: 'OpenAI API Key', placeholder: 'sk-...', type: 'password' },
          { label: 'Apify API Token', placeholder: 'apify_api_...', type: 'password' },
          { label: 'Target city', placeholder: 'New Delhi', type: 'text' },
        ].map(f => (
          <div key={f.label} style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>{f.label}</label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              style={styles.fieldInput}
              defaultValue={f.label === 'Target city' ? 'New Delhi' : ''}
            />
          </div>
        ))}
        <button style={styles.saveBtn}>Save settings</button>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%' },
  topbar: { background: '#fff', borderBottom: '0.5px solid #E4E1D9', padding: '16px 24px', flexShrink: 0 },
  topTitle: { fontSize: 14, fontWeight: 500, color: '#1A1916' },
  topMeta: { fontSize: 12, color: '#8A8680', marginTop: 1 },
  inner: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' },
  comingSoon: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center' },
  icon: { fontSize: 28, color: '#B4B0A8', marginBottom: 12 },
  title: { fontSize: 15, fontWeight: 500, color: '#1A1916', marginBottom: 8 },
  desc: { fontSize: 13, color: '#8A8680', maxWidth: 360, lineHeight: 1.6 },
  btn: { marginTop: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: '8px 16px', borderRadius: 8, background: '#C8522A', color: '#fff', border: 'none', cursor: 'pointer' },
  queueList: { marginTop: 24, display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 360 },
  queueItem: { background: '#F7F6F3', border: '0.5px solid #E4E1D9', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  queueName: { fontSize: 13, fontWeight: 500, color: '#1A1916' },
  queueSub: { fontSize: 11, color: '#8A8680' },
  sentCard: { background: '#fff', border: '0.5px solid #E4E1D9', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sentName: { fontSize: 13, fontWeight: 500, color: '#1A1916' },
  sentMeta: { fontSize: 11, color: '#8A8680', marginTop: 2 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldLabel: { fontSize: 12, color: '#5F5E5A', fontWeight: 500 },
  fieldInput: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: '9px 12px', border: '0.5px solid #E4E1D9', borderRadius: 8, background: '#fff', color: '#1A1916', outline: 'none' },
  saveBtn: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: '10px 20px', borderRadius: 8, background: '#C8522A', color: '#fff', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', marginTop: 8 },
};
