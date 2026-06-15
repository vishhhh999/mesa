import { supabase } from './supabase';

// Hash the API key using SHA-256 so we never store it plaintext in Supabase
async function hashKey(key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate the Anthropic key via a serverless proxy (avoids browser CORS)
export async function validateAnthropicKey(key) {
  try {
    const res = await fetch('/api/verify-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userKey: key.trim() }),
    });
    const data = await res.json();
    if (!res.ok) return { valid: false, error: data.error || 'Verification failed.' };
    return { valid: data.valid, error: data.error || '' };
  } catch (err) {
    return { valid: false, error: 'Could not reach verification server. Check your connection.' };
  }
}

// Login or create user by their hashed key
export async function loginWithKey(anthropicKey) {
  const keyHash = await hashKey(anthropicKey);

  // Try to find existing user
  const { data: existing } = await supabase
    .from('mesa_users')
    .select('id')
    .eq('key_hash', keyHash)
    .single();

  if (existing) {
    return { userId: existing.id, keyHash, isNew: false };
  }

  // Create new user
  const { data: created, error } = await supabase
    .from('mesa_users')
    .insert({ key_hash: keyHash })
    .select('id')
    .single();

  if (error) throw new Error('Failed to create account: ' + error.message);

  return { userId: created.id, keyHash, isNew: true };
}

// Load settings for a user
export async function loadSettings(userId) {
  const { data } = await supabase
    .from('mesa_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

// Save settings for a user (upsert)
export async function saveSettings(userId, settings) {
  const { error } = await supabase
    .from('mesa_settings')
    .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() });
  if (error) throw new Error('Failed to save settings: ' + error.message);
}

// Load restaurants for a user + location
export async function loadRestaurants(userId, locationKey) {
  const { data } = await supabase
    .from('mesa_restaurants')
    .select('data')
    .eq('user_id', userId)
    .eq('location_key', locationKey)
    .single();
  return data?.data || [];
}

// Save restaurants (upsert whole list per location)
// Guard: never overwrite existing data with an empty array
export async function saveRestaurants(userId, locationKey, restaurants) {
  if (!restaurants || restaurants.length === 0) {
    // Don't overwrite existing data with empty — only save if there's nothing there yet
    const existing = await loadRestaurants(userId, locationKey);
    if (existing && existing.length > 0) return; // skip — would erase real data
  }
  const { error } = await supabase
    .from('mesa_restaurants')
    .upsert({
      user_id: userId,
      location_key: locationKey,
      data: restaurants,
      updated_at: new Date().toISOString(),
    });
  if (error) throw new Error('Failed to save restaurants: ' + error.message);
}

// Load deck images for a restaurant
export async function loadDeckImages(userId, restaurantId) {
  const { data } = await supabase
    .from('mesa_deck_images')
    .select('hero, detail')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .single();
  if (!data) return null;
  return [data.hero, data.detail].filter(Boolean);
}

// Save deck images
export async function saveDeckImages(userId, restaurantId, hero, detail) {
  const { error } = await supabase
    .from('mesa_deck_images')
    .upsert({ user_id: userId, restaurant_id: restaurantId, hero, detail });
  if (error) throw new Error('Failed to save images: ' + error.message);
}
