export async function generateDeckImages(restaurant, openaiKey, anthropicKey, onProgress) {
  if (!openaiKey) throw new Error('No OpenAI API key. Add it in Settings.');
  if (!anthropicKey) throw new Error('No Anthropic API key. Add it in Settings.');

  // Step 1: Claude writes the image prompts
  onProgress?.('Writing image prompts...');
  const prompts = await writeImagePrompts(restaurant, anthropicKey);

  // Step 2: Generate both images
  const images = [];
  const shots = [
    { key: 'hero',   label: 'Generating hero food shot...' },
    { key: 'detail', label: 'Generating detail shot...' },
  ];

  for (let i = 0; i < shots.length; i++) {
    onProgress?.(shots[i].label);
    const img = await callGenerateImage(prompts[shots[i].key], openaiKey);
    images.push(img);
    if (i < shots.length - 1) await sleep(1000);
  }

  return images;
}

async function writeImagePrompts(restaurant, anthropicKey) {
  const response = await fetch('/api/write-image-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurant, anthropicKey }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Prompt writing error ${response.status}`);
  }

  return data.prompts; // { hero, detail }
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

  return data.image;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
