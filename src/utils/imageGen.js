export async function generateDeckImages(restaurant, openaiKey, onProgress) {
  if (!openaiKey) throw new Error('No OpenAI API key. Add it in Settings.');

  const { name, cuisine, area, audit } = restaurant;

  // Extract color hints from rebrand direction if present
  const colorHint = extractColorHint(audit?.rebrandDirection || '');
  const styleHint = extractStyleHint(audit?.rebrandDirection || '');

  const prompts = [
    // Hero food shot
    `${styleHint} food photography of the signature dish at ${name}, a ${cuisine} restaurant in ${area}. ${colorHint} Cinematic lighting, shallow depth of field, styled plating, photorealistic, editorial magazine quality. No text, no people, no restaurant exterior.`,
    // Ambiance / texture shot
    `${styleHint} close-up detail photography for a restaurant menu redesign. Ingredients, textures, or tableware associated with ${cuisine} cuisine. ${colorHint} Warm editorial tone, top-down or 45-degree angle, photorealistic. No text, no people.`,
  ];

  const images = [];
  for (let i = 0; i < prompts.length; i++) {
    onProgress?.(i, prompts.length);
    const img = await callGenerateImage(prompts[i], openaiKey);
    images.push(img);
    if (i < prompts.length - 1) await sleep(1000);
  }

  return images; // array of base64 strings
}

async function callGenerateImage(prompt, openaiKey) {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, openaiKey }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Image generation error ${response.status}`);
  }

  return data.image; // base64 string
}

function extractColorHint(rebrandDirection) {
  const hexMatches = rebrandDirection.match(/#[0-9A-Fa-f]{6}/g);
  if (hexMatches && hexMatches.length >= 1) {
    return `Color palette inspired by ${hexMatches.slice(0, 2).join(' and ')}.`;
  }
  // Keyword fallbacks
  if (/warm|terracotta|amber|golden/i.test(rebrandDirection)) return 'Warm amber and terracotta tones.';
  if (/dark|moody|noir|deep/i.test(rebrandDirection)) return 'Deep, moody, dark tones.';
  if (/minimal|clean|white|light/i.test(rebrandDirection)) return 'Clean, light, minimal aesthetic.';
  if (/vibrant|bold|colorful/i.test(rebrandDirection)) return 'Bold, vibrant colors.';
  return '';
}

function extractStyleHint(rebrandDirection) {
  if (/editorial|serif|magazine/i.test(rebrandDirection)) return 'Editorial,';
  if (/minimal|geometric|modern/i.test(rebrandDirection)) return 'Minimalist,';
  if (/rustic|vintage|heritage/i.test(rebrandDirection)) return 'Rustic, warm,';
  if (/luxury|premium|upscale/i.test(rebrandDirection)) return 'Luxury, high-end,';
  if (/playful|casual|fun/i.test(rebrandDirection)) return 'Vibrant, casual,';
  return 'Professional,';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
