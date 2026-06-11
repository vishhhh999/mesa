const ACTOR_ID = 'compass~crawler-google-places';
const APIFY_BASE = 'https://api.apify.com/v2';

export async function scrapeRestaurants(apifyToken, city, onStatus) {
  if (!apifyToken) throw new Error('No Apify token. Add it in Settings.');

  onStatus?.('Starting scraper...');

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

  onStatus?.('Crawling Google Maps...');
  await pollUntilFinished(apifyToken, runId, 300000, onStatus);

  onStatus?.('Fetching results...');
  const datasetRes = await fetch(
    `${APIFY_BASE}/actor-runs/${runId}/dataset/items?token=${apifyToken}&format=json&limit=50`
  );

  if (!datasetRes.ok) throw new Error('Failed to fetch results from Apify.');

  const items = await datasetRes.json();
  const normalized = normalizeResults(items);
  if (normalized.length === 0) throw new Error('No restaurants found. Try a different city name.');
  return normalized;
}

async function pollUntilFinished(token, runId, maxWait = 300000, onStatus) {
  const start = Date.now();
  let elapsed = 0;
  while (Date.now() - start < maxWait) {
    await sleep(6000);
    elapsed = Math.round((Date.now() - start) / 1000);
    onStatus?.(`Crawling Google Maps... ${elapsed}s`);

    const res = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
    if (!res.ok) continue;
    const { data } = await res.json();

    if (data.status === 'SUCCEEDED') return;
    if (data.status === 'FAILED' || data.status === 'ABORTED') {
      throw new Error(`Apify run ${data.status.toLowerCase()}. Check your token and try again.`);
    }
  }
  throw new Error('Scraper timed out after 5 minutes. Apify may be slow — try again.');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function normalizeResults(items) {
  return items
    .filter(item => {
      const cat = (item.categoryName || '').toLowerCase();
      const cats = (item.categories || []).map(c => c.toLowerCase());
      return cat.includes('restaurant') || cat.includes('cafe') || cat.includes('food') ||
        cats.some(c => c.includes('restaurant') || c.includes('cafe') || c.includes('food'));
    })
    .map((item, i) => {
      const photos = item.images || item.imageUrls || [];
      const photoScore = estimatePhotoScore(photos, item.reviewsCount);
      return {
        id: item.placeId || `scraped-${i}-${Date.now()}`,
        name: item.title || item.name || 'Unknown',
        cuisine: item.categoryName || item.categories?.[0] || 'Restaurant',
        area: extractArea(item.address || ''),
        address: item.address || '',
        rating: Math.round((item.totalScore || item.rating || 0) * 10) / 10,
        reviewCount: item.reviewsCount || 0,
        photoScore,
        website: item.website || null,
        phone: item.phone || '',
        status: 'new',
        selected: false,
        gmb: item.url || '',
        notes: '',
        photos: photos.slice(0, 3),
        scrapedAt: new Date().toISOString(),
      };
    })
    .filter(r => r.name !== 'Unknown' && r.rating > 0);
}

function extractArea(address) {
  if (!address) return '';
  const parts = address.split(',');
  if (parts.length >= 3) return parts[parts.length - 3].trim();
  if (parts.length === 2) return parts[0].trim();
  return address;
}

function estimatePhotoScore(photos, reviewCount) {
  let score = 0;
  if (photos.length === 0) score = 5 + Math.random() * 10;
  else if (photos.length <= 2) score = 15 + Math.random() * 15;
  else if (photos.length <= 5) score = 28 + Math.random() * 20;
  else score = 44 + Math.random() * 30;
  if (reviewCount > 1000) score = Math.min(score + 8, 95);
  return Math.round(score);
}
