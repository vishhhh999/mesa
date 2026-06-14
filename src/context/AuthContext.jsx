import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithKey, loadSettings, saveSettings as saveSettingsDB } from '../lib/auth';

const SESSION_KEY = 'mesa_session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId,    setUserId]    = useState(null);
  const [keyHash,   setKeyHash]   = useState(null);
  const [settings,  setSettings]  = useState(null);
  const [loading,   setLoading]   = useState(true); // checking for existing session

  // On mount, restore session from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const { userId: uid, keyHash: kh, anthropicKey } = JSON.parse(stored);
        setUserId(uid);
        setKeyHash(kh);
        // Reload settings from Supabase
        loadSettings(uid).then(s => {
          if (s) setSettings({ ...s, anthropicKey });
        }).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const login = async (anthropicKey) => {
    const { userId: uid, keyHash: kh, isNew } = await loginWithKey(anthropicKey);
    setUserId(uid);
    setKeyHash(kh);

    // Load or init settings
    const existing = await loadSettings(uid);
    const merged = {
      openai_key: '',
      apify_token: '',
      country: 'India',
      state: '',
      city: '',
      ...existing,
      anthropicKey, // keep in memory / sessionStorage only, never in Supabase
    };
    setSettings(merged);

    // Persist session (anthropicKey in sessionStorage, not Supabase)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: uid, keyHash: kh, anthropicKey }));

    return { isNew };
  };

  const logout = () => {
    setUserId(null);
    setKeyHash(null);
    setSettings(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const updateSettings = async (updates) => {
    const merged = { ...settings, ...updates };
    setSettings(merged);
    // Save to Supabase (everything except anthropicKey)
    const { anthropicKey, ...dbFields } = merged;
    await saveSettingsDB(userId, {
      openai_key:   dbFields.openai_key   || '',
      apify_token:  dbFields.apify_token  || '',
      country:      dbFields.country      || 'India',
      state:        dbFields.state        || '',
      city:         dbFields.city         || '',
    });
    // Update sessionStorage to keep anthropicKey in sync
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, anthropicKey }));
  };

  const locationLabel = () => {
    if (!settings) return 'No location set';
    if (settings.city)    return settings.city;
    if (settings.state)   return settings.state;
    if (settings.country) return settings.country;
    return 'No location set';
  };

  const searchLocation = () => {
    if (!settings) return '';
    return [settings.city, settings.state, settings.country].filter(Boolean).join(', ');
  };

  const locationKey = () => {
    return searchLocation().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'default';
  };

  return (
    <AuthContext.Provider value={{
      userId, keyHash, settings, loading,
      login, logout, updateSettings,
      locationLabel, searchLocation, locationKey,
      anthropicKey: settings?.anthropicKey || '',
      openaiKey:    settings?.openai_key   || '',
      apifyToken:   settings?.apify_token  || '',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
