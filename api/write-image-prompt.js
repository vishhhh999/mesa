export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { restaurant, anthropicKey } = req.body;

  if (!anthropicKey) return res.status(400).json({ error: 'No Anthropic API key provided' });
  if (!restaurant)   return res.status(400).json({ error: 'No restaurant data provided' });

  const { name, cuisine, area, audit } = restaurant;

  const systemPrompt = `You are a professional food and brand photographer and art director. You write precise, detailed image generation prompts for AI image models. Your prompts are specific, visual, and technically precise — they describe lighting, composition, color temperature, plating style, texture, and mood with exactness. You never use vague words like "beautiful" or "stunning". You write prompts that a photographer briefing a food stylist would actually say.`;

  const userPrompt = `Write two image generation prompts for a restaurant rebrand pitch deck.

Restaurant:
- Name: ${name}
- Cuisine: ${cuisine}
- Area: ${area}
- Brand assessment: ${audit?.brandAssessment || 'Not provided'}
- Rebrand direction: ${audit?.rebrandDirection || 'Not provided'}

Prompt 1 — Hero food shot: A cinematic, editorial-quality photograph of the restaurant's signature dish. The shot should embody the rebrand direction visually — lighting, color, plating style, and composition should all reflect the brand's new visual language.

Prompt 2 — Texture/ingredient detail shot: A close-up detail photograph (ingredients, tableware, textures, or a styled flat lay) that would work as a full-bleed menu section header or background image. Should feel like a companion piece to the hero shot in color and mood.

Rules:
- Each prompt must be 2-4 sentences
- Be specific about: lighting type (e.g. "single overhead softbox", "warm side-lit"), color temperature (e.g. "3200K tungsten", "5600K daylight"), composition (e.g. "45-degree overhead angle", "tight macro"), plating (e.g. "minimalist single-element plating on matte black ceramic")
- Reference the exact cuisine type so the food is recognizable
- Do NOT include any text, people, restaurant exterior, or signage
- Do NOT use the restaurant's name in the prompt

Return ONLY a JSON object with no preamble or markdown:
{
  "hero": "prompt text here",
  "detail": "prompt text here"
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
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || `Claude API error ${response.status}`,
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    try {
      const clean = text.replace(/^```(?:json)?|```$/gm, '').trim();
      const parsed = JSON.parse(clean);
      if (!parsed.hero || !parsed.detail) throw new Error('Missing prompt fields');
      return res.status(200).json({ prompts: parsed });
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          return res.status(200).json({ prompts: parsed });
        } catch {}
      }
      return res.status(500).json({ error: 'Could not parse prompt response', raw: text.slice(0, 200) });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
