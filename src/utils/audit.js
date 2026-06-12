export async function auditRestaurant(restaurant, anthropicKey) {
  if (!anthropicKey) throw new Error('No Anthropic API key. Add it in Settings.');

  const prompt = `You are a senior brand strategist and designer. Analyze this restaurant and produce a concise brand audit to support a rebrand pitch.

Restaurant details:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine}
- Area: ${restaurant.area}, ${restaurant.address}
- Google rating: ${restaurant.rating}/5 (${restaurant.reviewCount} reviews)
- Photo quality score: ${restaurant.photoScore}/100 (lower = weaker visuals)
- Website: ${restaurant.website || 'None found'}

Return ONLY a valid JSON object with exactly these keys, no preamble, no markdown fences:
{
  "brandAssessment": "2-3 sentences on what their current brand likely looks and feels like. Be specific — consider cuisine type, location signals, price point implied by rating and area, and photo quality.",
  "rebrandDirection": "2-3 sentences with a specific visual language recommendation. Name typography mood, provide a 2-color palette with hex codes, and describe a menu layout style. Make it specific to THIS restaurant.",
  "pitchAngle": "One sharp sentence under 20 words capturing why this restaurant needs a rebrand. Personal and insightful, not salesy."
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.error?.message || `Claude API error ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  try {
    // Strip any accidental markdown fences
    const clean = text.replace(/^```(?:json)?|```$/gm, '').trim();
    return JSON.parse(clean);
  } catch {
    // Last resort: try to extract JSON from the text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    throw new Error(`Could not parse audit for ${restaurant.name}. Response: ${text.slice(0, 100)}`);
  }
}

export async function auditBatch(restaurants, anthropicKey, onProgress) {
  const results = [];
  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    onProgress?.(i, restaurants.length, r.name);
    try {
      const audit = await auditRestaurant(r, anthropicKey);
      results.push({ id: r.id, audit, status: 'audited', error: null });
    } catch (err) {
      console.error(`Audit failed for ${r.name}:`, err);
      results.push({ id: r.id, audit: null, status: 'new', error: err.message });
    }
    if (i < restaurants.length - 1) await sleep(1000);
  }
  return results;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
