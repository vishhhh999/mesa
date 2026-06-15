const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { restaurant, images, imageFormat } = req.body;
  if (!restaurant) return res.status(400).json({ error: 'No restaurant data' });

  const mime = imageFormat === 'jpeg' ? 'image/jpeg' : 'image/png';

  let browser = null;
  try {
    // Get the executable path — this handles both local and Vercel Lambda environments
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
      defaultViewport: { width: 794, height: 1123 }, // A4 at 96dpi
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // Set longer timeout for font loading
    page.setDefaultNavigationTimeout(30000);

    const html = buildDeckHTML(restaurant, images || [], mime);

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait a beat for fonts to render
    await new Promise(r => setTimeout(r, 1500));

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      `attachment; filename="MESA_${restaurant.name.replace(/[^a-zA-Z0-9]/g,'_')}_deck.pdf"`
    );
    res.status(200).send(Buffer.from(pdf));

  } catch (err) {
    console.error('[generate-pdf] Error:', err.message, err.stack);
    res.status(500).json({
      error: `PDF generation failed: ${err.message}`,
      hint: err.message.includes('executablePath') || err.message.includes('chromium')
        ? 'Chromium binary not found. Check that @sparticuz/chromium is installed.'
        : err.message.includes('timeout')
        ? 'Page timed out loading. Try again.'
        : 'Check Vercel function logs for details.',
    });
  } finally {
    if (browser) {
      try { await browser.close(); } catch(e) { console.error('browser.close error:', e); }
    }
  }
};

// ── Color helpers ──────────────────────────────────────────────────────────

function extractColors(rebrandDirection) {
  const hexes = (rebrandDirection || '').match(/#[0-9A-Fa-f]{6}/g) || [];
  return {
    primary:   hexes[0] || '#1A1916',
    secondary: hexes[1] || '#C8B99A',
    palette:   hexes.slice(0, 5),
  };
}

function isDark(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (0.299*r + 0.587*g + 0.114*b) < 128;
}

// ── HTML template ──────────────────────────────────────────────────────────

function buildDeckHTML(restaurant, images, mime) {
  const { name, cuisine, area, audit } = restaurant;
  const colors     = extractColors(audit?.rebrandDirection);
  const [h, d]     = images;
  const heroB64    = h ? `data:${mime};base64,${h}` : null;
  const detailB64  = d ? `data:${mime};base64,${d}` : null;
  const accentDark = isDark(colors.primary);
  const accentText = accentDark ? '#FFFFFF' : '#0A0A0A';
  const accentSub  = accentDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

body {
  font-family: 'DM Sans', sans-serif;
  background: #FAFAF8;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color: #1A1916;
}

.page {
  width: 210mm;
  height: 297mm;
  overflow: hidden;
  position: relative;
  page-break-after: always;
}

/* ─── PAGE 1: COVER ─────────────────────────────────────────── */
.cover { background: #0A0A0A; display: flex; flex-direction: column; }

.hero-wrap { position: relative; height: 160mm; flex-shrink: 0; overflow: hidden; }

.hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.hero-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, ${colors.primary}44 0%, ${colors.secondary}22 100%);
}

.hero-gradient {
  position: absolute; bottom: 0; left: 0; right: 0; height: 88mm;
  background: linear-gradient(to top, #0A0A0A 20%, rgba(10,10,10,0.6) 60%, transparent 100%);
}

.hero-mesa-tag {
  position: absolute; top: 7mm; left: 7mm;
  font-family: 'DM Mono', monospace; font-size: 7pt;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}

.accent-rule { height: 2px; background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}66); flex-shrink: 0; }

.cover-body {
  flex: 1; padding: 8mm 14mm 7mm;
  display: flex; flex-direction: column; justify-content: space-between;
}

.cuisine-pill {
  display: inline-block;
  background: ${colors.primary}; color: ${accentText};
  font-family: 'DM Mono', monospace; font-size: 6.5pt;
  letter-spacing: 0.14em; text-transform: uppercase;
  padding: 2.5px 9px; border-radius: 2px;
  margin-bottom: 4.5mm; width: fit-content;
}

.cover-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 44pt; font-weight: 300;
  color: #F0ECE4; line-height: 1.02; letter-spacing: -0.015em;
  margin-bottom: 2.5mm;
}

.cover-area {
  font-family: 'DM Mono', monospace; font-size: 7.5pt;
  color: #4A4845; letter-spacing: 0.12em; text-transform: uppercase;
  margin-bottom: 7mm;
}

.cover-rule { width: 20mm; height: 1px; background: ${colors.primary}; margin-bottom: 5mm; }

.cover-pitch {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13.5pt; font-weight: 300; font-style: italic;
  color: #B4B0A8; line-height: 1.5; max-width: 158mm;
}

.cover-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 4mm; border-top: 1px solid #1C1C1C;
}

.cover-footer-text {
  font-family: 'DM Mono', monospace; font-size: 7pt;
  color: #3A3835; letter-spacing: 0.12em; text-transform: uppercase;
}

/* ─── PAGE 2: AUDIT ──────────────────────────────────────────── */
.audit-page { background: #FAFAF8; display: flex; flex-direction: column; }

.audit-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(to bottom, ${colors.primary}, ${colors.secondary}55); }

.audit-header { padding: 10mm 14mm 6mm 18mm; border-bottom: 1px solid #E8E4DE; flex-shrink: 0; }

.audit-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 6.5pt;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: ${colors.primary}; margin-bottom: 2.5mm;
}

.audit-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26pt; font-weight: 400; color: ${colors.primary};
  line-height: 1.1; letter-spacing: -0.01em;
}

.audit-body { flex: 1; padding: 6mm 14mm 0 18mm; overflow: hidden; display: flex; flex-direction: column; }

.block { margin-bottom: 5.5mm; }

.block-label {
  font-family: 'DM Mono', monospace; font-size: 6pt;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: #9A9489; margin-bottom: 2mm;
}

.block-text {
  font-family: 'DM Sans', sans-serif; font-size: 8.5pt;
  color: #2A2825; line-height: 1.65; font-weight: 300;
}

.callout {
  background: #F0EDE8; border-left: 3px solid ${colors.primary};
  padding: 5mm 6mm; margin-bottom: 5.5mm;
}

.callout .block-label { color: ${colors.primary}; }

.palette-section { margin-bottom: 5.5mm; }
.palette-row { display: flex; gap: 4.5mm; align-items: flex-start; margin-top: 2mm; }
.swatch-wrap { display: flex; flex-direction: column; align-items: center; gap: 1.5mm; }
.swatch { width: 12mm; height: 12mm; border-radius: 3px; border: 1px solid rgba(0,0,0,0.1); }
.swatch-hex { font-family: 'DM Mono', monospace; font-size: 5pt; color: #9A9489; }

.detail-wrap { flex: 1; overflow: hidden; min-height: 38mm; margin-bottom: 0; }
.detail-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.detail-caption {
  font-family: 'DM Mono', monospace; font-size: 5.5pt;
  color: #B4B0A8; letter-spacing: 0.06em;
  padding: 2mm 14mm 0 18mm; flex-shrink: 0;
}

.audit-footer {
  display: flex; justify-content: space-between;
  padding: 3mm 14mm; border-top: 1px solid #E8E4DE; flex-shrink: 0;
}
.footer-text { font-family: 'DM Mono', monospace; font-size: 6.5pt; color: #C4C0B8; letter-spacing: 0.08em; text-transform: uppercase; }

/* ─── PAGE 3: PROPOSAL ───────────────────────────────────────── */
.proposal-page { background: #0A0A0A; display: flex; flex-direction: column; }

.proposal-top-bar { height: 2px; background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}66); flex-shrink: 0; }

.proposal-header { padding: 11mm 14mm 7mm; flex-shrink: 0; }

.proposal-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 7pt;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: ${colors.primary}; margin-bottom: 4mm;
}

.proposal-headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: 38pt; font-weight: 300;
  color: #F0ECE4; line-height: 1.04; letter-spacing: -0.015em;
}

.proposal-headline em { color: ${colors.secondary}; font-style: italic; }

.proposal-divider { width: 18mm; height: 1px; background: ${colors.primary}; margin: 5mm 14mm 0; flex-shrink: 0; }

.deliverables { flex: 1; padding: 5mm 14mm 0; display: flex; flex-direction: column; }

.deliverable {
  display: grid; grid-template-columns: 13mm 1fr;
  padding: 5mm 0; border-bottom: 1px solid #1A1A18;
}
.deliverable:last-child { border-bottom: none; }

.del-num {
  font-family: 'DM Mono', monospace; font-size: 7.5pt;
  color: ${colors.primary}; font-weight: 500; padding-top: 1mm;
}
.del-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 13.5pt; font-weight: 400; color: #F0ECE4;
  margin-bottom: 1.5mm; line-height: 1.2;
}
.del-desc {
  font-family: 'DM Sans', sans-serif; font-size: 8pt;
  color: #5C5751; line-height: 1.6; font-weight: 300;
}

.cta {
  margin: 5mm 14mm 8mm;
  padding: 6mm 8mm; background: ${colors.primary};
  border-radius: 4px; display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.cta-main { font-family: 'Cormorant Garamond', serif; font-size: 16pt; font-weight: 400; color: ${accentText}; }
.cta-sub { font-family: 'DM Sans', sans-serif; font-size: 8pt; color: ${accentSub}; margin-top: 1.5mm; font-weight: 300; }
.cta-arrow { font-family: 'DM Mono', monospace; font-size: 18pt; color: ${accentText}; opacity: 0.5; }

.proposal-footer {
  display: flex; justify-content: space-between;
  padding: 3mm 14mm; border-top: 1px solid #1A1A18; flex-shrink: 0;
}
.proposal-footer .footer-text { color: #3A3835; }

@page { margin: 0; size: A4; }
</style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page cover">
  <div class="hero-wrap">
    ${heroB64
      ? `<img class="hero-img" src="${heroB64}" />`
      : `<div class="hero-placeholder"></div>`
    }
    <div class="hero-gradient"></div>
    <div class="hero-mesa-tag">MESA</div>
  </div>
  <div class="accent-rule"></div>
  <div class="cover-body">
    <div>
      <div class="cuisine-pill">${(cuisine || 'Business').toUpperCase()}</div>
      <div class="cover-name">${name}</div>
      <div class="cover-area">${area}</div>
      ${audit?.pitchAngle ? `<div class="cover-rule"></div><div class="cover-pitch">"${audit.pitchAngle}"</div>` : ''}
    </div>
    <div class="cover-footer">
      <span class="cover-footer-text">MESA · Outreach Studio</span>
      <span class="cover-footer-text">01 / 03</span>
    </div>
  </div>
</div>

<!-- PAGE 2: BRAND AUDIT -->
<div class="page audit-page" style="position:relative;">
  <div class="audit-accent"></div>
  <div class="audit-header">
    <div class="audit-eyebrow">Brand Audit</div>
    <div class="audit-name">${name}</div>
  </div>
  <div class="audit-body">
    <div class="block">
      <div class="block-label">Current Brand Assessment</div>
      <div class="block-text">${audit?.brandAssessment || '—'}</div>
    </div>
    <div class="callout">
      <div class="block-label">Rebrand Direction</div>
      <div class="block-text">${audit?.rebrandDirection || '—'}</div>
    </div>
    ${colors.palette.length > 0 ? `
    <div class="palette-section">
      <div class="block-label">Proposed Palette</div>
      <div class="palette-row">
        ${colors.palette.map(hex => `
          <div class="swatch-wrap">
            <div class="swatch" style="background:${hex};"></div>
            <div class="swatch-hex">${hex.toUpperCase()}</div>
          </div>`).join('')}
      </div>
    </div>` : ''}
    ${detailB64 ? `<div class="detail-wrap"><img class="detail-img" src="${detailB64}" /></div>` : ''}
  </div>
  ${detailB64 ? `<div class="detail-caption">AI-generated brand visual direction</div>` : ''}
  <div class="audit-footer">
    <span class="footer-text">MESA · Confidential</span>
    <span class="footer-text">02 / 03</span>
  </div>
</div>

<!-- PAGE 3: PROPOSAL -->
<div class="page proposal-page">
  <div class="proposal-top-bar"></div>
  <div class="proposal-header">
    <div class="proposal-eyebrow">The Proposal</div>
    <div class="proposal-headline">What we'll build<br><em>together.</em></div>
  </div>
  <div class="proposal-divider"></div>
  <div class="deliverables">
    <div class="deliverable">
      <div class="del-num">01</div>
      <div><div class="del-title">Brand Identity System</div><div class="del-desc">New logo, typography system, and color palette — built for your positioning, not borrowed from a template.</div></div>
    </div>
    <div class="deliverable">
      <div class="del-num">02</div>
      <div><div class="del-title">Menu Redesign</div><div class="del-desc">Full print-ready menu layout — hierarchy, section structure, and dish photography that makes ordering feel intentional.</div></div>
    </div>
    <div class="deliverable">
      <div class="del-num">03</div>
      <div><div class="del-title">Brand Guidelines</div><div class="del-desc">A concise, usable guide your team can actually follow — not a 60-page document nobody opens.</div></div>
    </div>
    <div class="deliverable">
      <div class="del-num">04</div>
      <div><div class="del-title">Digital Assets</div><div class="del-desc">Social templates, story formats, and cover images so your Instagram looks like your menu looks like your signage.</div></div>
    </div>
  </div>
  <div class="cta">
    <div><div class="cta-main">Ready to talk?</div><div class="cta-sub">Reply to this deck and we'll set up a 30-minute call.</div></div>
    <div class="cta-arrow">→</div>
  </div>
  <div class="proposal-footer">
    <span class="footer-text">MESA · Confidential</span>
    <span class="footer-text">03 / 03</span>
  </div>
</div>

</body>
</html>`;
}
