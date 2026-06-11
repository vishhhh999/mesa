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

Return ONLY a JSON object with these exact keys, no preamble or markdown:
{
  "brandAssessment": "2-3 sentences on what their current brand likely looks and feels like based on the data. Be specific about what signals weak or generic branding — consider their cuisine type, location, price point implied by rating and area, and photo quality score.",
  "rebrandDirection": "2-3 sentences on a specific visual language recommendation. Name the typography mood (e.g. geometric sans, editorial serif), a 2-color palette with hex codes, and a menu layout style. Make it specific to THIS restaurant, not generic.",
  "pitchAngle": "One sharp, punchy sentence (max 20 words) that captures exactly why this restaurant needs a rebrand. This goes in the outreach email subject line — make it feel personal and insightful, not salesy."
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    throw new Error('Claude returned unexpected format. Try again.');
  }
}

export async function auditBatch(restaurants, anthropicKey, onProgress) {
  const results = [];
  for (let i = 0; i < restaurants.length; i++) {
    const r = restaurants[i];
    onProgress?.(i, restaurants.length, r.name);
    try {
      const audit = await auditRestaurant(r, anthropicKey);
      results.push({ id: r.id, audit, status: 'audited' });
    } catch (err) {
      results.push({ id: r.id, audit: null, status: 'new', error: err.message });
    }
    // Small delay to avoid rate limiting
    if (i < restaurants.length - 1) await sleep(800);
  }
  return results;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
