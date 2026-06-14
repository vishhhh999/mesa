import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

// Single dark theme per skill — MESA is dark only
export const THEME = {
  bg:               '#0e0e0e',
  surface:          '#151515',
  elevated:         '#1c1c1c',
  border:           '#2a2a2a',
  borderHi:         '#3d3d3d',
  ink:              '#f0ece4',
  inkMuted:         '#9a9489',
  inkFaint:         '#5c5751',
  accent:           '#c8b99a',
  accentDim:        '#6b5f4a',
  accentBg:         '#1a1710',
  error:            '#eb5757',
  success:          '#6fcf97',
  warning:          '#f2994a',
  overlay:          'rgba(0,0,0,0.75)',
  // aliases kept for component compat
  surfaceAlt:       '#0e0e0e',
  borderLight:      '#1f1f1f',
  tableHead:        '#0e0e0e',
  tableRow:         '#151515',
  tableRowSelected: '#1a1710',
  scoreBarBg:       '#2a2a2a',
  emptyIconColor:   '#2a2a2a',
  inputBg:          '#0e0e0e',
  filterCountBg:    '#1c1c1c',
  filterCountColor: '#5c5751',
  btnGhostColor:    '#9a9489',
  accentLight:      '#1a1710',
  accentMid:        '#2e2616',
  navActive:        '#1a1710',
  statBg:           '#151515',
};

export function ThemeProvider({ children }) {
  useEffect(() => {
    document.body.style.background = THEME.bg;
    document.body.style.color = THEME.ink;
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: THEME, isDark: true }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
