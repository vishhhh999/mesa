export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { restaurant, anthropicKey } = req.body;

  if (!anthropicKey) {
    return res.status(400).json({ error: 'No Anthropic API key provided' });
  }

  if (!restaurant) {
    return res.status(400).json({ error: 'No restaurant data provided' });
  }

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

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || `Anthropic API error ${response.status}`,
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parse JSON from response
    let audit;
    try {
      const clean = text.replace(/^```(?:json)?|```$/gm, '').trim();
      audit = JSON.parse(clean);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { audit = JSON.parse(match[0]); }
        catch { return res.status(500).json({ error: 'Could not parse Claude response', raw: text.slice(0, 200) }); }
      } else {
        return res.status(500).json({ error: 'Claude returned unexpected format', raw: text.slice(0, 200) });
      }
    }

    return res.status(200).json({ audit });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
