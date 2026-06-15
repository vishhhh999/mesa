const PDFDocument = require('pdfkit');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { restaurant, images, imageFormat } = req.body;
  if (!restaurant) return res.status(400).json({ error: 'No restaurant data' });

  try {
    const pdfBuffer = await buildPDF(restaurant, images || []);
    const safeName  = restaurant.name.replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="MESA_${safeName}_deck.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('[generate-pdf]', err);
    res.status(500).json({ error: err.message || 'PDF generation failed' });
  }
};

// ── helpers ────────────────────────────────────────────────────

const MM  = 2.8346;   // 1mm in PDF points
const A4W = 210 * MM; // 595.3
const A4H = 297 * MM; // 841.9

function hex2rgb(hex) {
  const h = hex.replace('#','');
  return [
    parseInt(h.slice(0,2),16),
    parseInt(h.slice(2,4),16),
    parseInt(h.slice(4,6),16),
  ];
}

function isDark([r,g,b]) {
  return (0.299*r + 0.587*g + 0.114*b) < 128;
}

function extractColors(text = '') {
  const hexes = text.match(/#[0-9A-Fa-f]{6}/g) || [];
  const primary   = hexes[0] ? hex2rgb(hexes[0]) : [26,25,22];
  const secondary = hexes[1] ? hex2rgb(hexes[1]) : [200,185,154];
  return { primary, secondary, palette: hexes.slice(0,5).map(hex2rgb), hexes };
}

function base64ToBuffer(b64) {
  return Buffer.from(b64, 'base64');
}

function wrapText(doc, text, maxWidth) {
  // Returns array of lines that fit within maxWidth
  const words = (text || '').split(' ');
  const lines = [];
  let line    = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (doc.widthOfString(test) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawText(doc, text, x, y, opts = {}) {
  const {
    size = 10, color = [26,25,22], font = 'Helvetica',
    maxWidth, lineHeight = 1.4, align = 'left',
  } = opts;
  doc.font(font).fontSize(size).fillColor(color);
  if (maxWidth) {
    doc.text(text || '', x, y, {
      width: maxWidth, lineGap: size * (lineHeight - 1),
      align, lineBreak: true,
    });
  } else {
    doc.text(text || '', x, y, { lineBreak: false });
  }
}

function monoLabel(doc, text, x, y, color) {
  doc.font('Helvetica').fontSize(6).fillColor(color || [154,148,137]);
  doc.text((text || '').toUpperCase(), x, y, { characterSpacing: 1.2, lineBreak: false });
}

// ── PDF builder ────────────────────────────────────────────────

async function buildPDF(restaurant, images) {
  const { name, cuisine, area, audit } = restaurant;
  const colors = extractColors(audit?.rebrandDirection);
  const P = colors.primary;
  const S = colors.secondary;
  const accentText = isDark(P) ? [255,255,255] : [10,10,10];
  const accentSub  = isDark(P) ? [200,200,200] : [80,80,80];

  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      autoFirstPage: false,
      info: { Title: `${name} — Brand Deck by MESA`, Author: 'MESA Outreach Studio' },
    });

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ═══════════════════════════════════════════════════════
    // PAGE 1 — COVER
    // ═══════════════════════════════════════════════════════
    doc.addPage();

    const HERO_H = 168 * MM;

    // Dark background
    doc.rect(0, 0, A4W, A4H).fill([10,10,10]);

    // Hero image
    if (images[0]) {
      try {
        const imgBuf = base64ToBuffer(images[0]);
        doc.image(imgBuf, 0, 0, { width: A4W, height: HERO_H, cover: [A4W, HERO_H] });
      } catch(e) { console.warn('Hero image failed:', e.message); }
    }

    // Gradient overlay — simulate with layered semi-transparent rects
    const gradSteps = 8;
    for (let i = 0; i < gradSteps; i++) {
      const frac   = i / gradSteps;
      const rectH  = (HERO_H * 0.65) / gradSteps;
      const rectY  = HERO_H - (HERO_H * 0.65) + i * rectH;
      const opacity = frac * frac * 0.92; // quadratic for natural fade
      doc.rect(0, rectY, A4W, rectH + 1).fillOpacity(opacity).fill([10,10,10]);
    }
    doc.fillOpacity(1);

    // MESA watermark top-left
    doc.font('Helvetica').fontSize(7).fillColor([255,255,255]).fillOpacity(0.3)
       .text('MESA', 7*MM, 7*MM, { characterSpacing: 1.8, lineBreak: false });
    doc.fillOpacity(1);

    // Accent rule below image
    doc.rect(0, HERO_H, A4W, 2).fill(P);

    // Content area starts here
    const CX = 14 * MM; // left margin
    let cy   = HERO_H + 9*MM;

    // Cuisine pill
    const pillText  = (cuisine || 'Business').toUpperCase();
    const pillW     = doc.font('Helvetica').fontSize(6.5).widthOfString(pillText, { characterSpacing: 1.2 }) + 16;
    const pillH     = 5.5 * MM;
    doc.roundedRect(CX, cy, pillW, pillH, 1.5).fill(P);
    doc.font('Helvetica').fontSize(6.5).fillColor(accentText)
       .text(pillText, CX + 8, cy + pillH/2 - 3.2, { characterSpacing: 1.2, lineBreak: false });
    cy += pillH + 5*MM;

    // Restaurant name — large display
    doc.font('Helvetica-Bold').fontSize(40).fillColor([240,236,228]);
    const nameLines = wrapText(doc, name, A4W - CX*2);
    nameLines.forEach((line, i) => {
      doc.text(line, CX, cy + i * 42, { lineBreak: false });
    });
    cy += nameLines.length * 42 + 2.5*MM;

    // Area
    doc.font('Helvetica').fontSize(7.5).fillColor([74,72,69])
       .text((area || '').toUpperCase(), CX, cy, { characterSpacing: 1.2, lineBreak: false });
    cy += 7*MM;

    // Pitch angle
    if (audit?.pitchAngle) {
      // Divider rule
      doc.rect(CX, cy, 20*MM, 0.8).fill(P);
      cy += 5*MM;

      doc.font('Helvetica-Oblique').fontSize(12.5).fillColor([180,176,168]);
      const pitch     = `"${audit.pitchAngle}"`;
      const pitchMaxW = A4W - CX*2;
      doc.text(pitch, CX, cy, { width: pitchMaxW, lineGap: 6, lineBreak: true });
      cy += doc.heightOfString(pitch, { width: pitchMaxW, lineGap: 6 }) + 4*MM;
    }

    // Footer
    const footerY = A4H - 12*MM;
    doc.rect(CX, footerY - 4*MM, A4W - CX*2, 0.5).fillOpacity(0.15).fill([255,255,255]).fillOpacity(1);
    doc.font('Helvetica').fontSize(7).fillColor([58,56,53]).fillOpacity(0.8)
       .text('MESA · OUTREACH STUDIO', CX, footerY, { characterSpacing: 1.1, lineBreak: false });
    doc.text('01 / 03', A4W - CX - doc.widthOfString('01 / 03', { characterSpacing: 1.1 }), footerY, { characterSpacing: 1.1, lineBreak: false });
    doc.fillOpacity(1);

    // ═══════════════════════════════════════════════════════
    // PAGE 2 — BRAND AUDIT
    // ═══════════════════════════════════════════════════════
    doc.addPage();

    // Warm white bg
    doc.rect(0, 0, A4W, A4H).fill([250,249,247]);

    // Left accent bar
    doc.rect(0, 0, 3, A4H).fill(P);

    const AX = 18*MM; // left margin after bar
    let ay   = 10*MM;

    // Eyebrow
    monoLabel(doc, 'Brand Audit', AX, ay, P);
    ay += 6*MM;

    // Name
    doc.font('Helvetica-Bold').fontSize(24).fillColor(P)
       .text(name, AX, ay, { width: A4W - AX - 14*MM, lineBreak: true });
    ay += doc.heightOfString(name, { width: A4W - AX - 14*MM, font: 'Helvetica-Bold', fontSize: 24 }) + 2*MM;

    // Hairline rule
    doc.rect(AX, ay, A4W - AX - 14*MM, 0.5).fill([232,228,222]);
    ay += 5.5*MM;

    const bodyW = A4W - AX - 14*MM;

    // Brand Assessment
    monoLabel(doc, 'Current Brand Assessment', AX, ay);
    ay += 4.5*MM;
    doc.font('Helvetica').fontSize(8.5).fillColor([42,40,37]).lineGap(3.5)
       .text(audit?.brandAssessment || '—', AX, ay, { width: bodyW, lineBreak: true });
    ay += doc.heightOfString(audit?.brandAssessment || '—', { width: bodyW, lineGap: 3.5, font: 'Helvetica', fontSize: 8.5 }) + 5.5*MM;

    // Rebrand Direction callout block
    const rdText = audit?.rebrandDirection || '—';
    const rdH    = doc.font('Helvetica').fontSize(8.5).heightOfString(rdText, { width: bodyW - 12*MM, lineGap: 3.5 }) + 10*MM;
    doc.rect(AX, ay, bodyW, rdH).fill([240,237,232]);
    doc.rect(AX, ay, 3, rdH).fill(P);
    monoLabel(doc, 'Rebrand Direction', AX + 6*MM, ay + 5*MM, P);
    doc.font('Helvetica').fontSize(8.5).fillColor([42,40,37]).lineGap(3.5)
       .text(rdText, AX + 6*MM, ay + 9.5*MM, { width: bodyW - 12*MM, lineBreak: true });
    ay += rdH + 5.5*MM;

    // Palette swatches
    if (colors.palette.length > 0) {
      monoLabel(doc, 'Proposed Palette', AX, ay);
      ay += 4*MM;
      colors.palette.forEach((rgb, i) => {
        const sx = AX + i * 15*MM;
        const sy = ay;
        doc.rect(sx, sy, 12*MM, 12*MM).fill(rgb);
        doc.rect(sx, sy, 12*MM, 12*MM).stroke([210,206,200]).lineWidth(0.3);
        doc.font('Helvetica').fontSize(5.5).fillColor([154,148,137])
           .text(colors.hexes[i]?.toUpperCase() || '', sx, sy + 13*MM, { lineBreak: false });
      });
      ay += 17*MM;
    }

    // Detail image — fills remaining space
    const remainH = A4H - ay - 16*MM;
    if (images[1] && remainH > 25*MM) {
      try {
        const imgBuf = base64ToBuffer(images[1]);
        doc.image(imgBuf, AX, ay, { width: bodyW, height: remainH, cover: [bodyW, remainH] });
        ay += remainH + 2*MM;
        monoLabel(doc, 'AI-generated brand visual direction', AX, ay);
      } catch(e) { console.warn('Detail image failed:', e.message); }
    }

    // Footer
    doc.rect(0, A4H - 10*MM, A4W, 0.5).fill([232,228,222]);
    doc.font('Helvetica').fontSize(6.5).fillColor([196,192,184])
       .text('MESA · CONFIDENTIAL', AX, A4H - 7*MM, { characterSpacing: 1.1, lineBreak: false });
    doc.text('02 / 03', A4W - 14*MM - doc.widthOfString('02 / 03', { characterSpacing: 1.1 }), A4H - 7*MM, { characterSpacing: 1.1, lineBreak: false });

    // ═══════════════════════════════════════════════════════
    // PAGE 3 — PROPOSAL
    // ═══════════════════════════════════════════════════════
    doc.addPage();

    doc.rect(0, 0, A4W, A4H).fill([10,10,10]);

    // Top accent bar
    doc.rect(0, 0, A4W, 2).fill(P);

    const PX = 14*MM;
    let py   = 12*MM;

    // Eyebrow
    monoLabel(doc, 'The Proposal', PX, py, P);
    py += 6*MM;

    // Headline
    doc.font('Helvetica-Bold').fontSize(36).fillColor([240,236,228])
       .text("What we'll build", PX, py, { lineBreak: false });
    py += 38;
    doc.font('Helvetica-BoldOblique').fontSize(36).fillColor(S)
       .text('together.', PX, py, { lineBreak: false });
    py += 38 + 5*MM;

    // Divider
    doc.rect(PX, py, 18*MM, 0.8).fill(P);
    py += 6*MM;

    // Deliverables
    const deliverables = [
      ['01', 'Brand Identity System',
        'New logo, typography system, and color palette — built for your positioning, not borrowed from a template.'],
      ['02', 'Menu Redesign',
        'Full print-ready menu layout — hierarchy, section structure, and dish photography that makes ordering feel intentional.'],
      ['03', 'Brand Guidelines',
        'A concise, usable guide your team can actually follow — not a 60-page document nobody opens.'],
      ['04', 'Digital Assets',
        'Social templates, story formats, and cover images so your Instagram looks like your menu looks like your signage.'],
    ];

    const DW = A4W - PX*2;
    deliverables.forEach(([num, title, desc], i) => {
      const descH = doc.font('Helvetica').fontSize(8).heightOfString(desc, { width: DW - 14*MM, lineGap: 3 });
      const rowH  = descH + 18;
      const ry    = py;

      // Separator
      if (i > 0) {
        doc.rect(PX + 14*MM, ry - 1, DW - 14*MM, 0.5).fill([26,26,24]);
      }

      // Number
      doc.font('Helvetica-Bold').fontSize(8).fillColor(P)
         .text(num, PX, ry + 2, { lineBreak: false });

      // Title
      doc.font('Helvetica-Bold').fontSize(13).fillColor([240,236,228])
         .text(title, PX + 14*MM, ry, { lineBreak: false });

      // Description
      doc.font('Helvetica').fontSize(8).fillColor([92,87,81]).lineGap(3)
         .text(desc, PX + 14*MM, ry + 16, { width: DW - 14*MM, lineBreak: true });

      py += rowH + 7*MM;
    });

    // CTA block
    const ctaY = Math.max(py + 3*MM, A4H - 48*MM);
    const ctaH = 28*MM;
    doc.rect(PX, ctaY, DW, ctaH).fill(P);

    // CTA text
    doc.font('Helvetica-Bold').fontSize(16).fillColor(accentText)
       .text('Ready to talk?', PX + 8*MM, ctaY + 7*MM, { lineBreak: false });
    doc.font('Helvetica').fontSize(8.5).fillColor(accentSub)
       .text("Reply to this deck and we'll set up a 30-minute call.", PX + 8*MM, ctaY + 16*MM, { lineBreak: false });

    // Arrow
    doc.font('Helvetica').fontSize(20).fillColor(accentText).fillOpacity(0.45)
       .text('→', A4W - PX - 18*MM, ctaY + ctaH/2 - 10, { lineBreak: false });
    doc.fillOpacity(1);

    // Footer
    const pfY = A4H - 7*MM;
    doc.rect(0, pfY - 4*MM, A4W, 0.5).fill([26,26,24]);
    doc.font('Helvetica').fontSize(6.5).fillColor([58,56,53])
       .text('MESA · CONFIDENTIAL', PX, pfY, { characterSpacing: 1.1, lineBreak: false });
    doc.text('03 / 03', A4W - PX - doc.widthOfString('03 / 03', { characterSpacing: 1.1 }), pfY, { characterSpacing: 1.1, lineBreak: false });

    doc.end();
  });
}
