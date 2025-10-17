import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@deenify_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Permanently set to dark mode
  const theme: ThemeMode = 'dark';

  // No-op toggle function (does nothing)
  const toggleTheme = async () => {
    // Theme is permanently dark, no toggle needed
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isDark: true 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
