import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'mesa_settings';

const defaults = {
  anthropicKey: '',
  openaiKey: '',
  apifyToken: '',
  city: 'New Delhi',
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

  return (
    <KeysContext.Provider value={{ keys, saveKeys }}>
      {children}
    </KeysContext.Provider>
  );
}

export function useKeys() {
  return useContext(KeysContext);
}
