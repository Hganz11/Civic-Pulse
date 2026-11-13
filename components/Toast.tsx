import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/civic';
import { subscribeToast } from '@/constants/toast';

/**
 * Small message bar for "coming soon" notices and confirmations.
 * (Alert.alert does nothing in the browser, so this replaces it everywhere.)
 */
export function ToastHost({ bottom = 32 }: { bottom?: number }) {
  const [message, setMessage] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const off = subscribeToast((next) => {
      setMessage(next);
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: false }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: false }).start();
      }, 2400);
    });
    return () => {
      off();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[s.wrap, { bottom, opacity }]}
      accessibilityLiveRegion="polite"
    >
      {message ? (
        <View style={s.toast}>
          <Text style={s.text}>{message}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 100 },
  toast: {
    maxWidth: 420,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: { color: colors.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
