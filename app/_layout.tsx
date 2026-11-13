import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { LoadingScreen } from '@/components/LoadingScreen';
import { colors } from '@/constants/civic';
import { useStoresHydrated } from '@/stores/hydration';
import { useAuthStore } from '@/stores/useAuthStore';

// Keep the native splash on screen until our own loading screen has drawn its logo.
SplashScreen.preventAutoHideAsync().catch(() => {});

/** The loading screen stays at least this long so the animation is seen. Set to 0 to skip. */
const MIN_LOADING_MS = 1800;

/** Screens that need someone to be logged in (or browsing as a guest). */
const APP_SCREENS = ['dashboard', 'profile'];

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const hydrated = useStoresHydrated();
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);

  const [minTimePassed, setMinTimePassed] = useState(MIN_LOADING_MS <= 0);
  const [loadingGone, setLoadingGone] = useState(false);

  useEffect(() => {
    if (MIN_LOADING_MS <= 0) return;
    const id = setTimeout(() => setMinTimePassed(true), MIN_LOADING_MS);
    return () => clearTimeout(id);
  }, []);

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

  const hideNativeSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
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
