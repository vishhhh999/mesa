import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'mesa_settings';

const defaults = {
  anthropicKey: '',
  openaiKey: '',
  apifyToken: '',
  country: 'India',
  countryCode: 'IN',
  state: '',
  city: '',
  theme: 'light',
};

const KeysContext = createContext(null);

export function KeysProvider({ children }) {
  const [keys, setKeys] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  const saveKeys = (updated) => {
    const merged = { ...keys, ...updated };
    setKeys(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  };

  // Returns the most specific location label for display
  const locationLabel = () => {
    if (keys.city) return keys.city;
    if (keys.state) return keys.state;
    if (keys.country) return keys.country;
    return 'No location set';
  };

  // Returns the full search string for Apify
  const searchLocation = () => {
    const parts = [keys.city, keys.state, keys.country].filter(Boolean);
    return parts.join(', ');
  };

  // Storage key per location so each city keeps its own restaurant list
  const restaurantStorageKey = () => {
    const loc = searchLocation().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `mesa_restaurants_${loc || 'default'}`;
  };

  return (
    <KeysContext.Provider value={{ keys, saveKeys, locationLabel, searchLocation, restaurantStorageKey }}>
      {children}
    </KeysContext.Provider>
  );
}

export function useKeys() {
  return useContext(KeysContext);
}
