import { jsPDF } from 'jspdf';

export async function generateDeckPDF(restaurant, images) {
  const { name, cuisine, area, audit } = restaurant;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210;
  const H = 297;
  const MARGIN = 20;
  const CONTENT_W = W - MARGIN * 2;

  // Color palette
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  // Extract palette from rebrand direction
  const hexMatches = (audit?.rebrandDirection || '').match(/#[0-9A-Fa-f]{6}/g) || [];
  const primaryHex = hexMatches[0] || '#C8522A';
  const secondaryHex = hexMatches[1] || '#1A1916';
  const primary = hexToRgb(primaryHex);
  const secondary = hexToRgb(secondaryHex);

  // --- PAGE 1: Cover ---
  // Background
  doc.setFillColor(...secondary);
  doc.rect(0, 0, W, H, 'F');

  // Accent stripe
  doc.setFillColor(...primary);
  doc.rect(0, 0, 6, H, 'F');

  // MESA watermark top right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 0.3 }));
  doc.text('MESA · Outreach Studio', W - MARGIN, 14, { align: 'right' });
  doc.setGState(doc.GState({ opacity: 1 }));

  // Hero image if available
  if (images[0]) {
    try {
      doc.addImage(`data:image/png;base64,${images[0]}`, 'PNG', MARGIN + 6, 30, CONTENT_W - 6, 90, '', 'MEDIUM');
    } catch (e) {
      console.warn('Could not embed hero image:', e);
    }
  }

  // Cuisine tag
  doc.setFillColor(...primary);
  doc.roundedRect(MARGIN + 6, 130, cuisine.length * 2.2 + 10, 8, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(cuisine.toUpperCase(), MARGIN + 11, 135.5);

  // Restaurant name
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  const nameLines = doc.splitTextToSize(name, CONTENT_W - 6);
  doc.text(nameLines, MARGIN + 6, 150);

  // Area
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(area, MARGIN + 6, 150 + nameLines.length * 12 + 4);

  // Pitch angle
  if (audit?.pitchAngle) {
    const pitchY = 210;
    doc.setDrawColor(...primary);
    doc.setLineWidth(0.5);
    doc.line(MARGIN + 6, pitchY - 4, MARGIN + 30, pitchY - 4);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(255, 255, 255);
    const pitchLines = doc.splitTextToSize(`"${audit.pitchAngle}"`, CONTENT_W - 6);
    doc.text(pitchLines, MARGIN + 6, pitchY + 4);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Prepared by MESA · Confidential', MARGIN + 6, H - 12);
  doc.text('1', W - MARGIN, H - 12, { align: 'right' });

  // --- PAGE 2: Brand Audit ---
  doc.addPage();

  // Light background
  doc.setFillColor(247, 246, 243);
  doc.rect(0, 0, W, H, 'F');

  // Accent stripe
  doc.setFillColor(...primary);
  doc.rect(0, 0, 6, H, 'F');

  // Section header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primary);
  doc.text('BRAND AUDIT', MARGIN + 6, 24);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondary);
  doc.text(name, MARGIN + 6, 36);

  let y = 52;

  // Brand Assessment
  y = addSection(doc, 'Current Brand Assessment', audit?.brandAssessment || '', MARGIN + 6, y, CONTENT_W - 6, primary, secondary);
  y += 8;

  // Rebrand Direction
  y = addSection(doc, 'Rebrand Direction', audit?.rebrandDirection || '', MARGIN + 6, y, CONTENT_W - 6, primary, secondary);
  y += 8;

  // Color palette swatches
  if (hexMatches.length > 0) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primary);
    doc.text('PROPOSED PALETTE', MARGIN + 6, y);
    y += 6;

    hexMatches.slice(0, 4).forEach((hex, i) => {
      const rgb = hexToRgb(hex);
      doc.setFillColor(...rgb);
      doc.roundedRect(MARGIN + 6 + i * 22, y, 18, 18, 2, 2, 'F');
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text(hex.toUpperCase(), MARGIN + 6 + i * 22, y + 22);
    });
    y += 32;
  }

  // Second image
  if (images[1]) {
    try {
      const imgY = Math.max(y + 4, 200);
      if (imgY + 60 < H - 20) {
        doc.addImage(`data:image/png;base64,${images[1]}`, 'PNG', MARGIN + 6, imgY, CONTENT_W - 6, 60, '', 'MEDIUM');
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('AI-generated brand visual direction', MARGIN + 6, imgY + 64);
      }
    } catch (e) {
      console.warn('Could not embed second image:', e);
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Prepared by MESA · Confidential', MARGIN + 6, H - 12);
  doc.text('2', W - MARGIN, H - 12, { align: 'right' });

  // --- PAGE 3: Proposal ---
  doc.addPage();

  doc.setFillColor(247, 246, 243);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(...primary);
  doc.rect(0, 0, 6, H, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primary);
  doc.text('THE PROPOSAL', MARGIN + 6, 24);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondary);
  doc.text('What we\'ll build together', MARGIN + 6, 36);

  const deliverables = [
    ['Brand Identity System', 'New logo, typography system, and color palette tailored to your cuisine and positioning.'],
    ['Menu Redesign', 'Full menu layout redesign — print-ready, branded, and designed to drive orders.'],
    ['Brand Guidelines', 'A concise brand guide so your team applies the new identity consistently.'],
    ['Digital Assets', 'Social media templates, story formats, and cover images to match the new brand.'],
  ];

  let dy = 52;
  deliverables.forEach(([title, desc], i) => {
    // Number
    doc.setFillColor(...primary);
    doc.circle(MARGIN + 10, dy + 3, 4, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}`, MARGIN + 10, dy + 5, { align: 'center' });

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondary);
    doc.text(title, MARGIN + 20, dy + 5);

    // Description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const descLines = doc.splitTextToSize(desc, CONTENT_W - 20);
    doc.text(descLines, MARGIN + 20, dy + 12);

    dy += descLines.length * 5 + 20;
  });

  // CTA box
  const ctaY = Math.max(dy + 10, 220);
  doc.setFillColor(...primary);
  doc.roundedRect(MARGIN + 6, ctaY, CONTENT_W - 6, 28, 4, 4, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Ready to talk?', MARGIN + 16, ctaY + 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Reply to this deck and we\'ll set up a 30-minute call.', MARGIN + 16, ctaY + 21);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Prepared by MESA · Confidential', MARGIN + 6, H - 12);
  doc.text('3', W - MARGIN, H - 12, { align: 'right' });

  return doc;
}

function addSection(doc, label, text, x, y, maxW, primary, secondary) {
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...primary);
  doc.text(label.toUpperCase(), x, y);

  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(text || '—', maxW);
  doc.text(lines, x, y);
  return y + lines.length * 5;
}
