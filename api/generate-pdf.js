const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { restaurant, images, imageFormat } = req.body;
  if (!restaurant) return res.status(400).json({ error: 'No restaurant data' });
  const mime = imageFormat === 'jpeg' ? 'image/jpeg' : 'image/png';

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    const html = buildDeckHTML(restaurant, images || [], mime);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="MESA_${restaurant.name.replace(/[^a-zA-Z0-9]/g, '_')}_deck.pdf"`);
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message || 'PDF generation failed' });
  } finally {
    if (browser) await browser.close();
  }
};

function extractColors(rebrandDirection) {
  const hexes = (rebrandDirection || '').match(/#[0-9A-Fa-f]{6}/g) || [];
  return {
    primary:   hexes[0] || '#1A1916',
    secondary: hexes[1] || '#C8B99A',
    palette:   hexes.slice(0, 5),
  };
}

function buildDeckHTML(restaurant, images, mime = 'image/png') {
  const { name, cuisine, area, audit } = restaurant;
  const colors = extractColors(audit?.rebrandDirection);
  const [heroImg, detailImg] = images;

  const heroB64   = heroImg   ? `data:${mime};base64,${heroImg}`   : null;
  const detailB64 = detailImg ? `data:${mime};base64,${detailImg}` : null;

  // Determine if primary color is dark (for contrast decisions)
  const isDark = (hex) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return (0.299*r + 0.587*g + 0.114*b) < 128;
  };

  const accentIsDark = isDark(colors.primary);
  const accentText   = accentIsDark ? '#FFFFFF' : '#0A0A0A';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #FAFAF8;
    color: #1A1916;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── PAGE WRAPPER ───────────────────────────────── */
  .page {
    width: 210mm;
    min-height: 297mm;
    position: relative;
    overflow: hidden;
    page-break-after: always;
  }

  /* ═══════════════════════════════════════════════
     PAGE 1 — COVER
  ═══════════════════════════════════════════════ */
  .cover {
    background: #0A0A0A;
    display: flex;
    flex-direction: column;
    height: 297mm;
  }

  .cover-image-wrap {
    position: relative;
    height: 168mm;
    overflow: hidden;
    flex-shrink: 0;
  }

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .cover-image-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, ${colors.primary}33 0%, ${colors.secondary}22 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Bottom-to-top gradient over image */
  .cover-image-gradient {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 80mm;
    background: linear-gradient(to top, #0A0A0A 0%, transparent 100%);
  }

  /* Thin accent rule at bottom of image */
  .cover-accent-rule {
    height: 2px;
    background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%);
    flex-shrink: 0;
  }

  .cover-content {
    flex: 1;
    padding: 9mm 16mm 8mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .cover-cuisine-tag {
    display: inline-flex;
    align-items: center;
    background: ${colors.primary};
    color: ${accentText};
    font-family: 'DM Mono', monospace;
    font-size: 7pt;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 3px 10px 3px;
    border-radius: 2px;
    margin-bottom: 5mm;
    width: fit-content;
  }

  .cover-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42pt;
    font-weight: 300;
    color: #F0ECE4;
    line-height: 1.05;
    letter-spacing: -0.01em;
    margin-bottom: 3mm;
  }

  .cover-area {
    font-family: 'DM Mono', monospace;
    font-size: 8pt;
    color: #5C5751;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 7mm;
  }

  .cover-divider {
    width: 24mm;
    height: 1px;
    background: ${colors.primary};
    margin-bottom: 5mm;
  }

  .cover-pitch {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14pt;
    font-weight: 300;
    font-style: italic;
    color: #C4C0B8;
    line-height: 1.5;
    max-width: 160mm;
  }

  .cover-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 5mm;
    border-top: 1px solid #1C1C1C;
  }

  .cover-mesa-mark {
    font-family: 'DM Mono', monospace;
    font-size: 8pt;
    color: #3D3D3D;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .cover-page-num {
    font-family: 'DM Mono', monospace;
    font-size: 8pt;
    color: #3D3D3D;
  }

  /* ═══════════════════════════════════════════════
     PAGE 2 — BRAND AUDIT
  ═══════════════════════════════════════════════ */
  .audit-page {
    background: #FAFAF8;
    height: 297mm;
    display: flex;
    flex-direction: column;
  }

  /* Left accent bar */
  .audit-accent-bar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, ${colors.primary} 0%, ${colors.secondary} 100%);
  }

  .audit-header {
    padding: 10mm 16mm 6mm 20mm;
    border-bottom: 1px solid #E8E5DF;
    flex-shrink: 0;
  }

  .audit-section-label {
    font-family: 'DM Mono', monospace;
    font-size: 7pt;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: ${colors.primary};
    margin-bottom: 3mm;
  }

  .audit-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28pt;
    font-weight: 400;
    color: ${colors.primary};
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  .audit-body {
    flex: 1;
    padding: 7mm 16mm 0 20mm;
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow: hidden;
  }

  .audit-block {
    margin-bottom: 6mm;
  }

  .audit-block-label {
    font-family: 'DM Mono', monospace;
    font-size: 6.5pt;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9A9489;
    margin-bottom: 2.5mm;
  }

  .audit-block-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 9pt;
    color: #2A2825;
    line-height: 1.65;
    font-weight: 300;
  }

  /* Rebrand direction callout */
  .audit-callout {
    background: #F4F2EE;
    border-left: 3px solid ${colors.primary};
    padding: 5mm 6mm;
    margin-bottom: 6mm;
  }

  /* Palette row */
  .palette-row {
    display: flex;
    gap: 5mm;
    align-items: flex-start;
    margin-bottom: 6mm;
  }

  .swatch-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5mm;
  }

  .swatch {
    width: 14mm;
    height: 14mm;
    border-radius: 3px;
    border: 1px solid rgba(0,0,0,0.08);
  }

  .swatch-hex {
    font-family: 'DM Mono', monospace;
    font-size: 5.5pt;
    color: #9A9489;
    letter-spacing: 0.04em;
  }

  /* Detail image */
  .detail-image-wrap {
    flex: 1;
    position: relative;
    overflow: hidden;
    margin: 0 0mm 0 0;
    min-height: 40mm;
    max-height: 55mm;
  }

  .detail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .detail-image-caption {
    font-family: 'DM Mono', monospace;
    font-size: 6pt;
    color: #B4B0A8;
    letter-spacing: 0.06em;
    padding: 2mm 20mm 0;
    flex-shrink: 0;
  }

  .audit-footer {
    display: flex;
    justify-content: space-between;
    padding: 3mm 16mm;
    border-top: 1px solid #E8E5DF;
    flex-shrink: 0;
  }

  .footer-label {
    font-family: 'DM Mono', monospace;
    font-size: 7pt;
    color: #B4B0A8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  /* ═══════════════════════════════════════════════
     PAGE 3 — PROPOSAL
  ═══════════════════════════════════════════════ */
  .proposal-page {
    background: #0A0A0A;
    height: 297mm;
    display: flex;
    flex-direction: column;
  }

  .proposal-top-rule {
    height: 2px;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary});
    flex-shrink: 0;
  }

  .proposal-header {
    padding: 12mm 16mm 8mm;
    flex-shrink: 0;
  }

  .proposal-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 7pt;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${colors.primary};
    margin-bottom: 4mm;
  }

  .proposal-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36pt;
    font-weight: 300;
    color: #F0ECE4;
    line-height: 1.05;
    letter-spacing: -0.01em;
  }

  .proposal-headline em {
    color: ${colors.secondary === '#C8B99A' ? colors.primary : colors.secondary};
    font-style: italic;
  }

  .proposal-rule {
    width: 20mm;
    height: 1px;
    background: ${colors.primary};
    margin: 5mm 16mm;
    flex-shrink: 0;
  }

  .deliverables {
    flex: 1;
    padding: 0 16mm;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .deliverable {
    display: grid;
    grid-template-columns: 14mm 1fr;
    gap: 0 5mm;
    padding: 5mm 0;
    border-bottom: 1px solid #1C1C1C;
  }

  .deliverable:last-child {
    border-bottom: none;
  }

  .deliverable-num {
    font-family: 'DM Mono', monospace;
    font-size: 8pt;
    color: ${colors.primary};
    padding-top: 1mm;
    font-weight: 500;
  }

  .deliverable-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14pt;
    font-weight: 400;
    color: #F0ECE4;
    margin-bottom: 1.5mm;
    line-height: 1.2;
  }

  .deliverable-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 8.5pt;
    color: #5C5751;
    line-height: 1.6;
    font-weight: 300;
  }

  /* CTA block */
  .cta-block {
    margin: 5mm 16mm 8mm;
    padding: 6mm 8mm;
    background: ${colors.primary};
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .cta-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16pt;
    font-weight: 400;
    color: ${accentText};
    line-height: 1.2;
  }

  .cta-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 8.5pt;
    color: ${accentIsDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'};
    margin-top: 1.5mm;
    font-weight: 300;
  }

  .cta-arrow {
    font-family: 'DM Mono', monospace;
    font-size: 18pt;
    color: ${accentText};
    opacity: 0.6;
  }

  .proposal-footer {
    display: flex;
    justify-content: space-between;
    padding: 3mm 16mm;
    border-top: 1px solid #1C1C1C;
    flex-shrink: 0;
  }

  @media print {
    .page { page-break-after: always; }
  }
</style>
</head>
<body>

<!-- ═══ PAGE 1: COVER ═══════════════════════════════════════ -->
<div class="page cover">
  <div class="cover-image-wrap">
    ${heroB64
      ? `<img class="cover-image" src="${heroB64}" />`
      : `<div class="cover-image-placeholder"></div>`
    }
    <div class="cover-image-gradient"></div>
  </div>
  <div class="cover-accent-rule"></div>
  <div class="cover-content">
    <div>
      <div class="cover-cuisine-tag">${cuisine || 'Business'}</div>
      <div class="cover-name">${name}</div>
      <div class="cover-area">${area}</div>
      ${audit?.pitchAngle ? `
        <div class="cover-divider"></div>
        <div class="cover-pitch">"${audit.pitchAngle}"</div>
      ` : ''}
    </div>
    <div class="cover-footer">
      <div class="cover-mesa-mark">MESA · Outreach Studio</div>
      <div class="cover-page-num">01 / 03</div>
    </div>
  </div>
</div>

<!-- ═══ PAGE 2: BRAND AUDIT ═════════════════════════════════ -->
<div class="page audit-page" style="position: relative;">
  <div class="audit-accent-bar"></div>
  <div class="audit-header">
    <div class="audit-section-label">Brand Audit</div>
    <div class="audit-name">${name}</div>
  </div>

  <div class="audit-body">
    <div class="audit-block">
      <div class="audit-block-label">Current Brand Assessment</div>
      <div class="audit-block-text">${audit?.brandAssessment || '—'}</div>
    </div>

    <div class="audit-callout">
      <div class="audit-block-label" style="color: ${colors.primary};">Rebrand Direction</div>
      <div class="audit-block-text">${audit?.rebrandDirection || '—'}</div>
    </div>

    ${colors.palette.length > 0 ? `
    <div class="audit-block">
      <div class="audit-block-label">Proposed Palette</div>
      <div class="palette-row">
        ${colors.palette.map(hex => `
          <div class="swatch-wrap">
            <div class="swatch" style="background: ${hex};"></div>
            <div class="swatch-hex">${hex.toUpperCase()}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${detailB64 ? `
    <div class="detail-image-wrap">
      <img class="detail-image" src="${detailB64}" />
    </div>
    ` : ''}
  </div>

  ${detailB64 ? `<div class="detail-image-caption">AI-generated brand visual direction</div>` : ''}

  <div class="audit-footer">
    <div class="footer-label">MESA · Confidential</div>
    <div class="footer-label">02 / 03</div>
  </div>
</div>

<!-- ═══ PAGE 3: PROPOSAL ════════════════════════════════════ -->
<div class="page proposal-page">
  <div class="proposal-top-rule"></div>
  <div class="proposal-header">
    <div class="proposal-eyebrow">The Proposal</div>
    <div class="proposal-headline">What we'll build<br><em>together.</em></div>
  </div>
  <div class="proposal-rule"></div>

  <div class="deliverables">
    <div class="deliverable">
      <div class="deliverable-num">01</div>
      <div>
        <div class="deliverable-title">Brand Identity System</div>
        <div class="deliverable-desc">New logo, typography system, and color palette — built for your positioning, not borrowed from a template.</div>
      </div>
    </div>
    <div class="deliverable">
      <div class="deliverable-num">02</div>
      <div>
        <div class="deliverable-title">Menu Redesign</div>
        <div class="deliverable-desc">Full print-ready menu layout — hierarchy, section structure, and dish photography that makes ordering feel intentional.</div>
      </div>
    </div>
    <div class="deliverable">
      <div class="deliverable-num">03</div>
      <div>
        <div class="deliverable-title">Brand Guidelines</div>
        <div class="deliverable-desc">A concise, usable guide your team can actually follow — not a 60-page document nobody opens.</div>
      </div>
    </div>
    <div class="deliverable">
      <div class="deliverable-num">04</div>
      <div>
        <div class="deliverable-title">Digital Assets</div>
        <div class="deliverable-desc">Social templates, story formats, and cover images so your Instagram looks like your menu looks like your signage.</div>
      </div>
    </div>
  </div>

  <div class="cta-block">
    <div>
      <div class="cta-text">Ready to talk?</div>
      <div class="cta-sub">Reply to this deck and we'll set up a 30-minute call.</div>
    </div>
    <div class="cta-arrow">→</div>
  </div>

  <div class="proposal-footer">
    <div class="footer-label" style="color: #3D3D3D;">MESA · Confidential</div>
    <div class="footer-label" style="color: #3D3D3D;">03 / 03</div>
  </div>
</div>

</body>
</html>`;
}
