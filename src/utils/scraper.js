const ACTOR_ID = 'compass~crawler-google-places';
const APIFY_BASE = 'https://api.apify.com/v2';

export async function scrapeRestaurants(apifyToken, city) {
  if (!apifyToken) throw new Error('No Apify token. Add it in Settings.');

  const runRes = await fetch(
    `${APIFY_BASE}/acts/${ACTOR_ID}/runs?token=${apifyToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchStringsArray: [`restaurants in ${city}`],
        maxCrawledPlacesPerSearch: 20,
        language: 'en',
        maxImages: 3,
        exportPlaceUrls: false,
        additionalInfo: false,
        scrapeDirectories: false,
        deeperCityScrape: false,
      }),
    }
  );

  if (!runRes.ok) {
    const err = await runRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Apify error ${runRes.status}`);
  }

  const { data: run } = await runRes.json();
  const runId = run.id;

  await pollUntilFinished(apifyToken, runId);

  const datasetRes = await fetch(
    `${APIFY_BASE}/actor-runs/${runId}/dataset/items?token=${apifyToken}&format=json&limit=50`
  );

  if (!datasetRes.ok) throw new Error('Failed to fetch results from Apify.');

  const items = await datasetRes.json();
  return normalizeResults(items);
}

async function pollUntilFinished(token, runId, maxWait = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    await sleep(4000);
    const res = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
    const { data } = await res.json();
    if (data.status === 'SUCCEEDED') return;
    if (data.status === 'FAILED' || data.status === 'ABORTED') {
      throw new Error(`Apify run ${data.status.toLowerCase()}.`);
    }
  }
  throw new Error('Scraper timed out after 2 minutes.');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function normalizeResults(items) {
  return items
    .filter(item => item.categoryName?.toLowerCase().includes('restaurant') || item.categories?.some(c => c.toLowerCase().includes('restaurant')))
    .map((item, i) => {
      const photos = item.images || item.imageUrls || [];
      const photoScore = estimatePhotoScore(photos, item.reviewsCount);
      return {
        id: item.placeId || `scraped-${i}`,
        name: item.title || item.name || 'Unknown',
        cuisine: item.categoryName || (item.categories?.[0]) || 'Restaurant',
        area: extractArea(item.address || item.street || ''),
        address: item.address || '',
        rating: item.totalScore || item.rating || 0,
        reviewCount: item.reviewsCount || 0,
        photoScore,
        website: item.website || null,
        phone: item.phone || '',
        status: 'new',
        selected: false,
        gmb: item.url || '',
        notes: '',
        photos: photos.slice(0, 3),
      };
    })
    .filter(r => r.name !== 'Unknown' && r.rating > 0);
}

function extractArea(address) {
  if (!address) return '';
  const parts = address.split(',');
  return parts.length > 1 ? parts[parts.length - 3]?.trim() || parts[1]?.trim() : address;
}

function estimatePhotoScore(photos, reviewCount) {
  let score = 0;
  if (photos.length === 0) score = 5;
  else if (photos.length <= 2) score = 15 + Math.random() * 15;
  else if (photos.length <= 5) score = 30 + Math.random() * 20;
  else score = 45 + Math.random() * 30;
  if (reviewCount > 1000) score = Math.min(score + 10, 95);
  return Math.round(score);
}
