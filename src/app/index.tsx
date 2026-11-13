import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { AuthScreen, Button, DashedLine, type IconName } from '@/components/auth/ui';
import { colors, fonts, radius } from '@/constants/civic';
import { useAuthStore } from '@/stores/useAuthStore';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'camera-outline',
    title: 'Report in a minute',
    body: 'Take a photo, drop a pin, and send it to the right department.',
  },
  {
    icon: 'progress-check',
    title: 'Follow every step',
    body: 'See when your report is received, scheduled, and fixed.',
  },
  {
    icon: 'vote-outline',
    title: 'Vote on priorities',
    body: 'Help decide which problems your neighborhood tackles first.',
  },
];

const pct = (n: number) => `${n}%` as `${number}%`;

/** One gentle pulse on the pinned report. Skipped when the device asks for reduced motion. */
function PinPulse() {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) return;
      loop = Animated.loop(
        Animated.timing(t, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      );
      loop.start();
    });
    return () => loop?.stop();
  }, [t]);

  return (
    <Animated.View
      style={[
        s.pulse,
        {
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.4] }) }],
        },
      ]}
    />
  );
}

function Hero() {
  return (
    <View
      style={s.hero}
      accessible
      accessibilityRole="image"
      accessibilityLabel="A city map with a pinned problem report"
    >
      {[20, 40, 60, 80].map((p) => (
        <View key={`v${p}`} style={[s.gridV, { left: pct(p) }]} />
      ))}
      {[25, 50, 75].map((p) => (
        <View key={`h${p}`} style={[s.gridH, { top: pct(p) }]} />
      ))}

      <View style={s.road}>
        <DashedLine color={colors.accent} dashes={26} style={s.roadDashes} />
      </View>

      <View style={s.pinWrap}>
        <PinPulse />
        <View style={s.pin}>
          <MaterialCommunityIcons name="map-marker" size={24} color={colors.accentInk} />
        </View>
      </View>

      <View style={s.chip}>
        <View style={s.chipDot} />
        <Text style={s.chipText}>Pothole reported</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);

  return (
    <AuthScreen>
      <Hero />

      <View style={s.copy}>
        <Text style={s.title} accessibilityRole="header">
          Fix your street, one report at a time.
        </Text>
        <Text style={s.body}>
          Report potholes, broken lights, and water leaks, then follow each one until it is
          resolved.
        </Text>
      </View>

      <View style={s.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={s.feature}>
            <View style={s.featureIcon}>
              <MaterialCommunityIcons name={f.icon} size={20} color={colors.accent} />
            </View>
            <View style={s.featureText}>
              <Text style={s.featureTitle}>{f.title}</Text>
              <Text style={s.featureBody}>{f.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s.actions}>
        <Button label="Create account" onPress={() => router.push('/register')} />
        <Button label="Log in" variant="secondary" onPress={() => router.push('/login')} />
        <Button
          label="Browse the map as a guest"
          variant="link"
          onPress={() => {
            continueAsGuest();
            router.replace('/dashboard');
          }}
        />
        <Text style={s.guestNote}>Guests can view reports but can't post.</Text>
      </View>
    </AuthScreen>
  );
}

const s = StyleSheet.create({
  hero: {
    height: 208,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: 8,
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  road: {
    position: 'absolute',
    left: '-20%',
    width: '140%',
    top: '52%',
    height: 30,
    backgroundColor: colors.surfaceRaised,
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  roadDashes: { paddingHorizontal: 8 },
  pinWrap: {
    position: 'absolute',
    left: '62%',
    top: '26%',
    width: 44,
    height: 44,
    marginLeft: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
  },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },

  copy: { marginTop: 28 },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 24, marginTop: 12 },

  features: { marginTop: 28 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: { flex: 1 },
  featureTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  featureBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 2 },

  actions: { marginTop: 12, gap: 12 },
  guestNote: { color: colors.textFaint, fontSize: 13, textAlign: 'center' },
});
