import { jsPDF } from 'jspdf';

// ─── helpers ──────────────────────────────────────────────────────────────
const hex2rgb = (hex) => [
  parseInt(hex.slice(1,3),16),
  parseInt(hex.slice(3,5),16),
  parseInt(hex.slice(5,7),16),
];

// Draw a rectangle that bleeds to the page edge
const bleed = (doc, x, y, w, h, r, g, b) => {
  doc.setFillColor(r,g,b);
  doc.rect(x, y, w, h, 'F');
};

// Mono uppercase label
const monoLabel = (doc, text, x, y, r, g, b) => {
  doc.setFont('helvetica','normal');
  doc.setFontSize(7);
  doc.setTextColor(r,g,b);
  doc.text(text.toUpperCase(), x, y);
};

// Body text with auto line break
const bodyText = (doc, text, x, y, maxW, r, g, b, size = 9.5) => {
  doc.setFont('helvetica','normal');
  doc.setFontSize(size);
  doc.setTextColor(r,g,b);
  const lines = doc.splitTextToSize(text || '—', maxW);
  doc.text(lines, x, y);
  return y + lines.length * (size * 0.42);
};

const footer = (doc, W, H, page, textR, textG, textB) => {
  doc.setFont('helvetica','normal');
  doc.setFontSize(7);
  doc.setTextColor(textR,textG,textB);
  doc.text('MESA · CONFIDENTIAL', 20, H - 10);
  doc.text(`${page}`, W - 20, H - 10, { align:'right' });
};

// ─── main export ──────────────────────────────────────────────────────────
export async function generateDeckPDF(restaurant, images) {
  const { name, cuisine, area, audit } = restaurant;

  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const W = 210, H = 297;

  // Extract brand palette — cap at 4 colors
  const hexMatches = (audit?.rebrandDirection || '').match(/#[0-9A-Fa-f]{6}/g) || [];
  // Use extracted brand primary if available, otherwise a dark neutral
  const brandPrimary = hexMatches[0] ? hex2rgb(hexMatches[0]) : [26,26,46];
  const brandAccent  = hexMatches[1] ? hex2rgb(hexMatches[1]) : [201,168,76];

  // Fixed page structure colors — never use brand color as full background
  const DARK  = [10, 10, 10];   // near-black for cover
  const LIGHT = [250, 249, 247]; // warm white for content pages
  const MID   = [245, 244, 242]; // slightly darker for callout blocks

  // ═══════════════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════════════
  bleed(doc, 0, 0, W, H, ...DARK);

  // Hero image — full bleed top half
  if (images[0]) {
    try {
      doc.addImage(`data:image/png;base64,${images[0]}`, 'PNG', 0, 0, W, 148, '', 'MEDIUM');
      // Gradient overlay over image bottom so text is readable
      // Simulate with semi-transparent rect (jsPDF doesn't do real gradients)
      doc.setFillColor(10,10,10);
      doc.setGState(doc.GState({ opacity: 0.6 }));
      doc.rect(0, 100, W, 48, 'F');
      doc.setGState(doc.GState({ opacity: 1 }));
    } catch(e) { console.warn('Hero image embed failed:', e); }
  }

  // Brand accent bar — thin, bottom of image
  doc.setFillColor(...brandAccent);
  doc.rect(0, 148, W, 1.5, 'F');

  // MESA label — top left, over image
  doc.setFont('helvetica','bold');
  doc.setFontSize(8);
  doc.setTextColor(255,255,255);
  doc.setGState(doc.GState({ opacity: 0.5 }));
  doc.text('MESA', 20, 16);
  doc.setGState(doc.GState({ opacity: 1 }));

  // Cuisine tag — bottom of image area
  const tagW = cuisine.length * 1.9 + 10;
  doc.setFillColor(...brandAccent);
  doc.roundedRect(20, 155, tagW, 6.5, 1, 1, 'F');
  doc.setFont('helvetica','bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...DARK);
  doc.text(cuisine.toUpperCase(), 25, 159.5);

  // Restaurant name — large, white
  doc.setFont('helvetica','bold');
  doc.setFontSize(36);
  doc.setTextColor(240, 236, 228);
  const nameLines = doc.splitTextToSize(name, W - 40);
  doc.text(nameLines, 20, 174);

  // Area
  doc.setFont('helvetica','normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 116, 112);
  doc.text(area, 20, 174 + nameLines.length * 15 + 4);

  // Divider line
  const divY = 210;
  doc.setDrawColor(...brandAccent);
  doc.setLineWidth(0.4);
  doc.line(20, divY, 56, divY);

  // Pitch angle
  if (audit?.pitchAngle) {
    doc.setFont('helvetica','italic');
    doc.setFontSize(12);
    doc.setTextColor(200, 196, 190);
    const pitchLines = doc.splitTextToSize(`"${audit.pitchAngle}"`, W - 44);
    doc.text(pitchLines, 20, divY + 10);
  }

  footer(doc, W, H, 1, 60,60,60);

  // ═══════════════════════════════════════════════
  // PAGE 2 — BRAND AUDIT
  // ═══════════════════════════════════════════════
  doc.addPage();
  bleed(doc, 0, 0, W, H, ...LIGHT);

  // Left accent column
  doc.setFillColor(...brandPrimary);
  doc.rect(0, 0, 3, H, 'F');

  // Section label
  monoLabel(doc, 'Brand Audit', 20, 22, ...brandAccent);

  // Restaurant name headline
  doc.setFont('helvetica','bold');
  doc.setFontSize(26);
  doc.setTextColor(...brandPrimary);
  doc.text(name, 20, 36);

  // Thin rule under name
  doc.setDrawColor(220, 218, 214);
  doc.setLineWidth(0.3);
  doc.line(20, 40, W - 20, 40);

  let y = 50;

  // ── Brand Assessment ──
  monoLabel(doc, 'Current Brand Assessment', 20, y, ...brandAccent);
  y += 5;
  y = bodyText(doc, audit?.brandAssessment, 20, y, W - 40, 40, 38, 36) + 10;

  // ── Rebrand Direction ──
  // Callout block
  doc.setFillColor(...MID);
  const rdStartY = y - 2;
  const rdLines  = doc.splitTextToSize(audit?.rebrandDirection || '—', W - 56);
  const rdH      = rdLines.length * 4.2 + 18;
  doc.rect(16, rdStartY, W - 32, rdH, 'F');
  doc.setFillColor(...brandAccent);
  doc.rect(16, rdStartY, 2.5, rdH, 'F');

  monoLabel(doc, 'Rebrand Direction', 24, y + 4, ...brandAccent);
  y = bodyText(doc, audit?.rebrandDirection, 24, y + 10, W - 48, 40, 38, 36) + 16;

  // ── Palette swatches ──
  if (hexMatches.length > 0) {
    monoLabel(doc, 'Proposed Palette', 20, y, ...brandAccent);
    y += 5;
    hexMatches.slice(0, 5).forEach((hex, i) => {
      const rgb = hex2rgb(hex);
      const sx = 20 + i * 30;
      doc.setFillColor(...rgb);
      // Swatch with thin border if light color
      doc.roundedRect(sx, y, 22, 22, 2, 2, 'F');
      doc.setDrawColor(210,208,204);
      doc.setLineWidth(0.2);
      doc.roundedRect(sx, y, 22, 22, 2, 2, 'S');
      doc.setFont('helvetica','normal');
      doc.setFontSize(5.5);
      doc.setTextColor(100,98,96);
      doc.text(hex.toUpperCase(), sx, y + 26);
    });
    y += 34;
  }

  // ── Detail image ──
  if (images[1] && y < H - 70) {
    try {
      const imgH = Math.min(65, H - y - 22);
      doc.addImage(`data:image/png;base64,${images[1]}`, 'PNG', 20, y, W - 40, imgH, '', 'MEDIUM');
      // Caption
      doc.setFont('helvetica','normal');
      doc.setFontSize(6.5);
      doc.setTextColor(160,158,154);
      doc.text('AI-generated brand visual direction', 20, y + imgH + 5);
    } catch(e) { console.warn('Detail image embed failed:', e); }
  }

  footer(doc, W, H, 2, 160,158,154);

  // ═══════════════════════════════════════════════
  // PAGE 3 — PROPOSAL
  // ═══════════════════════════════════════════════
  doc.addPage();
  bleed(doc, 0, 0, W, H, ...DARK);

  // Brand accent column
  doc.setFillColor(...brandAccent);
  doc.rect(0, 0, 3, H, 'F');

  // Header
  monoLabel(doc, 'The Proposal', 20, 22, ...brandAccent);
  doc.setFont('helvetica','bold');
  doc.setFontSize(28);
  doc.setTextColor(240, 236, 228);
  doc.text("What we'll build", 20, 38);
  doc.setFontSize(28);
  doc.setTextColor(...brandAccent);
  doc.text('together.', 20, 50);

  // Rule
  doc.setDrawColor(...brandAccent);
  doc.setLineWidth(0.4);
  doc.line(20, 57, 56, 57);

  const deliverables = [
    ['01', 'Brand Identity System', 'New logo, typography, and color palette — built for your cuisine and positioning, not borrowed from a template.'],
    ['02', 'Menu Redesign',         'Full print-ready menu layout — hierarchy, section structure, and dish photography that makes ordering feel intentional.'],
    ['03', 'Brand Guidelines',      'A concise, usable brand guide your team can actually follow — not a 60-page document nobody opens.'],
    ['04', 'Digital Assets',        'Social templates, story formats, and cover images so your Instagram looks like your menu looks like your signage.'],
  ];

  let dy = 68;
  deliverables.forEach(([num, title, desc]) => {
    // Number
    doc.setFont('helvetica','bold');
    doc.setFontSize(9);
    doc.setTextColor(...brandAccent);
    doc.text(num, 20, dy + 5);

    // Title
    doc.setFont('helvetica','bold');
    doc.setFontSize(12);
    doc.setTextColor(240, 236, 228);
    doc.text(title, 36, dy + 5);

    // Description
    doc.setFont('helvetica','normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 116, 112);
    const descLines = doc.splitTextToSize(desc, W - 56);
    doc.text(descLines, 36, dy + 12);

    // Divider
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.3);
    dy += descLines.length * 4 + 22;
    doc.line(36, dy - 4, W - 20, dy - 4);
  });

  // CTA block
  const ctaY = Math.max(dy + 8, 232);
  doc.setFillColor(...brandAccent);
  doc.roundedRect(20, ctaY, W - 40, 32, 3, 3, 'F');
  doc.setFont('helvetica','bold');
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text('Ready to talk?', 32, ctaY + 13);
  doc.setFont('helvetica','normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 36, 28);
  doc.text("Reply to this deck and we'll set up a 30-minute call.", 32, ctaY + 22);

  footer(doc, W, H, 3, 60, 60, 60);

  return doc;
}
