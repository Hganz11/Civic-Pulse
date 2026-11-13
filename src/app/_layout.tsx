import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';

import { LoadingScreen } from '@/components/LoadingScreen';
import { colors } from '@/constants/civic';
import { useStoresHydrated } from '@/stores/hydration';
import { useAuthStore } from '@/stores/useAuthStore';

// Keep the native splash on screen until our own loading screen has drawn its logo.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * How long the native splash screen (logo on the dark background) stays up, in milliseconds.
 * The splash only exists in a real build, so the browser skips it.
 */
const SPLASH_MS = Platform.OS === 'web' ? 0 : 5000;

/**
 * How long the loading screen stays up AFTER the splash, at minimum. Set to 0 to skip it.
 * For a normal app you would use about 1500 to 2000; the long value is for demos.
 */
const MIN_LOADING_MS = 6000;

/** Screens that need someone to be logged in (or browsing as a guest). */
const APP_SCREENS = ['dashboard', 'profile'];

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const hydrated = useStoresHydrated();
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);

  const [splashHidden, setSplashHidden] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(MIN_LOADING_MS <= 0);
  const [loadingGone, setLoadingGone] = useState(false);
  const splashStarted = useRef(false);

  // The loading screen's minimum time only starts counting once the splash is gone,
  // so the two screens are each seen for their full length.
  useEffect(() => {
    if (!splashHidden || MIN_LOADING_MS <= 0) return;
    const id = setTimeout(() => setMinTimePassed(true), MIN_LOADING_MS);
    return () => clearTimeout(id);
  }, [splashHidden]);

  // Route guard, driven by the auth store:
  //  - nobody logged in and not a guest  -> app screens send you back to onboarding
  //  - someone logged in                 -> onboarding / login / register send you to the map
  useEffect(() => {
    if (!hydrated || !navigationState?.key) return;
    const first = segments[0] as string | undefined;
    const inApp = !!first && APP_SCREENS.includes(first);

    if (!user && !isGuest && inApp) router.replace('/');
    else if (user && !inApp) router.replace('/dashboard');
  }, [hydrated, navigationState?.key, segments, user, isGuest, router]);

  // Called once the logo is drawn: keep the native splash up for SPLASH_MS, then hide it.
  const hideNativeSplash = useCallback(() => {
    if (splashStarted.current) return;
    splashStarted.current = true;
    setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      setSplashHidden(true);
    }, SPLASH_MS);
  }, []);

  // Safety net: never wait more than 3 seconds for the logo to report that it has loaded.
  useEffect(() => {
    const id = setTimeout(hideNativeSplash, 3000);
    return () => clearTimeout(id);
  }, [hideNativeSplash]);
  const onLoadingHidden = useCallback(() => setLoadingGone(true), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade',
        }}
      />
      {!loadingGone ? (
        <LoadingScreen
          ready={hydrated && minTimePassed}
          onImageLoaded={hideNativeSplash}
          onHidden={onLoadingHidden}
        />
      ) : null}
    </View>
  );
}
