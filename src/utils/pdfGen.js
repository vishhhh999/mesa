// Compress a base64 image by drawing it on a canvas and re-encoding as JPEG
async function compressImage(base64, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Scale down if larger than maxWidth
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Export as JPEG — much smaller than PNG for photos
      const compressed = canvas.toDataURL('image/jpeg', quality);
      // Strip the data:image/jpeg;base64, prefix
      resolve(compressed.split(',')[1]);
    };
    img.onerror = () => resolve(base64); // fallback: send as-is
    img.src = `data:image/png;base64,${base64}`;
  });
}

export async function generateDeckPDF(restaurant, images) {
  // Compress images before sending — reduces payload from ~8MB to ~400KB
  let compressedImages = [];
  if (images && images.length > 0) {
    compressedImages = await Promise.all(
      images.map(img => img ? compressImage(img) : null)
    );
  }

  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurant, images: compressedImages, imageFormat: 'jpeg' }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `PDF generation failed (${response.status})`);
  }

  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `MESA_${restaurant.name.replace(/[^a-zA-Z0-9]/g, '_')}_deck.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
