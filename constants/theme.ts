/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#2C3E50',
    background: '#FDFCFA',
    tint: '#4CAF50',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#4CAF50',
    border: '#E1E5E9',
    secondaryText: '#34495E',
    cardBackground: '#FFFFFF',
    gradientStart: '#FDFCFA',
    gradientEnd: '#F5F9FA',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0D1B2A',
    tint: '#66BB6A',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#66BB6A',
    border: '#2C2C2E',
    secondaryText: '#E0E0E0',
    cardBackground: '#1A1A1A',
    gradientStart: '#2A3B4A',
    gradientEnd: '#3A3A3A',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** Primary font for headings - Arabic text */
    primary: 'NotoNaskhArabic-Regular',
    /** Secondary font for body text - Latin text */
    secondary: 'Lato-Regular',
    /** Roboto font for counters and bold text */
    roboto: 'Roboto-Bold',
    /** Fallback fonts */
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    /** Primary font for headings - Arabic text */
    primary: 'NotoNaskhArabic-Regular',
    /** Secondary font for body text - Latin text */
    secondary: 'Lato-Regular',
    /** Roboto font for counters and bold text */
    roboto: 'Roboto-Bold',
    /** Fallback fonts */
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    /** Primary font for headings - Arabic text */
    primary: "'Noto Naskh Arabic', 'Amiri', 'Scheherazade New', serif",
    /** Secondary font for body text - Latin text */
    secondary: "'Lato', 'Open Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    /** Roboto font for counters and bold text */
    roboto: "'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    /** Fallback fonts */
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
