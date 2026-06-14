import { supabase } from './supabase';

// Hash the API key using SHA-256 so we never store it plaintext in Supabase
async function hashKey(key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate the Anthropic key is real by making a minimal API call
export async function validateAnthropicKey(key) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });
    // 200 = valid, 401 = invalid key, anything else = network/server issue
    if (res.status === 401) return { valid: false, error: 'Invalid API key.' };
    if (!res.ok && res.status !== 200) return { valid: false, error: `API error ${res.status} — try again.` };
    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Could not reach Anthropic API. Check your connection.' };
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
export async function saveRestaurants(userId, locationKey, restaurants) {
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
