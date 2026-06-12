export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, openaiKey } = req.body;

  if (!openaiKey) return res.status(400).json({ error: 'No OpenAI API key provided' });
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'medium',
        output_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || `OpenAI API error ${response.status}`,
      });
    }

    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;

    if (!b64) return res.status(500).json({ error: 'No image data returned from OpenAI' });

    return res.status(200).json({ image: b64 });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
