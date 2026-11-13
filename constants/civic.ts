import type { Href, useRouter } from 'expo-router';
import { Platform } from 'react-native';

import { showToast } from '@/constants/toast';

type AppRouter = ReturnType<typeof useRouter>;

/**
 * Civic Pulse design tokens.
 * Direction: deep teal "night survey" background with one road-marking yellow accent.
 * Yellow is reserved for the primary action, focus, and the map motif so it stays meaningful.
 */
export const colors = {
  bg: '#0E1B22',
  surface: '#15272F',
  surfaceRaised: '#1B323C',
  border: '#2A434E',
  text: '#F1F4F2',
  textMuted: '#9DB2B9',
  textFaint: '#7F959D', // >= 4.5:1 on surface and bg
  accent: '#F6C945',
  accentDim: 'rgba(246, 201, 69, 0.45)',
  accentInk: '#1B1606', // text on top of the accent color
  success: '#4FD1A5',
  danger: '#FF8A7A',
};

export const fonts = {
  // Serif headlines give the app a "public notice" feel; body text stays on the system sans.
  display: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
};

export const radius = { field: 10, button: 14, tile: 14, sheet: 24 };

/**
 * The screen users land on after logging in or signing up (app/dashboard.tsx).
 * Set it to null to show a reminder instead of navigating.
 */
export const HOME_ROUTE = '/dashboard' as Href | null;

export function enterApp(router: AppRouter) {
  if (HOME_ROUTE) {
    router.replace(HOME_ROUTE);
  } else {
    showToast('Set HOME_ROUTE in constants/civic.ts to open your main screen.');
  }
}

export function goBack(router: AppRouter) {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Placeholder for features that are not wired up yet (Feed, Impact, legal pages...). */
export function comingSoon(feature: string) {
  showToast(`${feature} is coming soon.`);
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
