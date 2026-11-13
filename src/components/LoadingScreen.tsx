import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/civic';

const DASHES = 12;
const MESSAGES = [
  'Restoring your session',
  'Loading reports',
  'Syncing your neighborhood',
  'Getting the map ready',
  'Almost there',
];

/**
 * Full-screen loading view. The logo is the same image, at the same size and position, as the
 * native splash screen, so the hand-off from splash to loading looks like one continuous screen.
 * The dashed "road" below sweeps while the app starts.
 *
 * - `ready`: when true, the screen fades out and then calls `onHidden`.
 * - `onImageLoaded`: called once the logo is drawn (the parent hides the native splash here).
 */
export function LoadingScreen({
  ready,
  onImageLoaded,
  onHidden,
}: {
  ready: boolean;
  onImageLoaded?: () => void;
  onHidden?: () => void;
}) {
  const fade = useRef(new Animated.Value(1)).current;
  const wordmark = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(-1)).current;
  const [step, setStep] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    Animated.timing(wordmark, {
      toValue: 1,
      duration: 500,
      delay: 250,
      useNativeDriver: false,
    }).start();
  }, [wordmark]);

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: DASHES + 3,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, sweep]);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, MESSAGES.length - 1)), 1400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    Animated.timing(fade, { toValue: 0, duration: 320, useNativeDriver: false }).start(
      ({ finished }) => {
        if (finished) onHidden?.();
      },
    );
  }, [ready, fade, onHidden]);

  return (
    <Animated.View
      style={[s.screen, { opacity: fade }]}
      pointerEvents={ready ? 'none' : 'auto'}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading Civic Pulse"
    >
      {/* Logo: centered exactly like the native splash image (200 x 200) */}
      <View style={s.center} pointerEvents="none">
        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={s.logo}
          resizeMode="contain"
          onLoadEnd={onImageLoaded}
          accessibilityIgnoresInvertColors
        />
      </View>

      <Animated.View style={[s.wordmarkBlock, { opacity: wordmark }]}>
        <Text style={s.wordmark}>Civic Pulse</Text>
        <Text style={s.tagline}>Fix your street, one report at a time.</Text>
      </Animated.View>

      <View style={s.bottom}>
        <View style={s.dashes}>
          {Array.from({ length: DASHES }, (_, i) => (
            <Animated.View
              key={i}
              style={[
                s.dash,
                {
                  opacity: reduceMotion
                    ? 0.6
                    : sweep.interpolate({
                        inputRange: [i - 1, i, i + 3],
                        outputRange: [0.2, 1, 0.2],
                        extrapolate: 'clamp',
                      }),
                },
              ]}
            />
          ))}
        </View>
        <Text style={s.status} accessibilityLiveRegion="polite">
          {MESSAGES[step]}…
        </Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg, zIndex: 999 },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 200, height: 200 },
  wordmarkBlock: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '50%',
    marginTop: 112,
    alignItems: 'center',
  },
  wordmark: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  tagline: { color: colors.textMuted, fontSize: 14, marginTop: 6, textAlign: 'center' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: '14%', alignItems: 'center' },
  dashes: { flexDirection: 'row', gap: 8 },
  dash: { width: 14, height: 3, borderRadius: 2, backgroundColor: colors.accent },
  status: { color: colors.textFaint, fontSize: 13, marginTop: 14 },
});
