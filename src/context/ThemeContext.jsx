import React, { createContext, useContext, useEffect } from 'react';
import { useKeys } from './KeysContext';

const ThemeContext = createContext(null);

export const THEMES = {
  light: {
    bg: '#F7F6F3',
    surface: '#FFFFFF',
    surfaceAlt: '#F7F6F3',
    border: '#E4E1D9',
    borderLight: '#F0EDE8',
    ink: '#1A1916',
    inkMuted: '#8A8680',
    inkFaint: '#B4B0A8',
    accent: '#C8522A',
    accentLight: '#FDF3EF',
    accentMid: '#F5D8CC',
    tableHead: '#F7F6F3',
    tableRow: '#FFFFFF',
    tableRowSelected: '#FDF3EF',
    tableRowHover: '#FDFCFA',
    overlay: 'rgba(26,25,22,0.55)',
    navActive: '#FDF3EF',
    statBg: '#FFFFFF',
    inputBg: '#FFFFFF',
    btnGhostBg: 'transparent',
    btnGhostColor: '#5F5E5A',
    filterCountBg: '#F0EDE8',
    filterCountColor: '#8A8680',
    scoreBarBg: '#EDE9E3',
    queueItemBg: '#F7F6F3',
    emptyIconColor: '#D4D0C8',
  },
  dark: {
    bg: '#111110',
    surface: '#1A1917',
    surfaceAlt: '#111110',
    border: '#2A2825',
    borderLight: '#222120',
    ink: '#F0EDE8',
    inkMuted: '#7A7672',
    inkFaint: '#4A4845',
    accent: '#D4623A',
    accentLight: '#1F1410',
    accentMid: '#3A1E14',
    tableHead: '#111110',
    tableRow: '#1A1917',
    tableRowSelected: '#1F1410',
    tableRowHover: '#1E1D1B',
    overlay: 'rgba(0,0,0,0.7)',
    navActive: '#1F1410',
    statBg: '#1A1917',
    inputBg: '#111110',
    btnGhostBg: 'transparent',
    btnGhostColor: '#9A9690',
    filterCountBg: '#222120',
    filterCountColor: '#7A7672',
    scoreBarBg: '#2A2825',
    queueItemBg: '#111110',
    emptyIconColor: '#3A3835',
  },
};

export function ThemeProvider({ children }) {
  const { keys } = useKeys();
  const theme = THEMES[keys.theme] || THEMES.light;

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.ink;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark: keys.theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
