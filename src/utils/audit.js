export async function auditRestaurant(restaurant, anthropicKey) {
  if (!anthropicKey) throw new Error('No Anthropic API key. Add it in Settings.');

  const response = await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurant, anthropicKey }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Audit API error ${response.status}`);
  }

  if (!data.audit) {
    throw new Error('No audit data returned from server');
  }

  return data.audit;
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
    if (i < restaurants.length - 1) await sleep(800);
  }
  return results;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
