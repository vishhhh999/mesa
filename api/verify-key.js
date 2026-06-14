export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userKey } = req.body;
  if (!userKey) return res.status(400).json({ error: 'No key provided' });

  // Use a validator key stored in Vercel env vars — never in the codebase
  const validatorKey = process.env.ANTHROPIC_VALIDATOR_KEY;
  if (!validatorKey) {
    return res.status(500).json({ error: 'Validator not configured. Add ANTHROPIC_VALIDATOR_KEY to Vercel environment variables.' });
  }

  try {
    // Use the validator key to make a cheap call — just checking the user's key format and existence
    // We actually test the USER's key directly (server-side, no CORS issue)
    const res2 = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': userKey.trim(),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });

    if (res2.status === 401) return res.status(200).json({ valid: false, error: 'Invalid API key.' });
    if (res2.status === 200 || res2.status === 400) return res.status(200).json({ valid: true });
    // Any other status — treat as valid if key wasn't rejected
    return res.status(200).json({ valid: res2.status !== 401 });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
}
