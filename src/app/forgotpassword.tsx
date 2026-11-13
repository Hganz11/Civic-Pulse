import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  AuthHeader,
  AuthInput,
  AuthScreen,
  Button,
  TopBar,
} from '@/components/auth/ui';
import { colors, goBack, isEmail } from '@/constants/civic';

const RESEND_SECONDS = 30;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const sendLink = async () => {
    if (!isEmail(email)) {
      setError('Enter the email address you signed up with.');
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      // TODO: replace with your real "send reset link" request.
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSent(true);
      setCooldown(RESEND_SECONDS);
    } catch {
      setError("We couldn't send the link. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const useAnotherEmail = () => {
    setSent(false);
    setCooldown(0);
    setError(undefined);
  };

  return (
    <AuthScreen topBar={<TopBar onBack={() => goBack(router)} />}>
      {sent ? (
        <>
          <AuthHeader icon="email-check-outline" title="Check your email" />

          <View accessibilityLiveRegion="polite">
            <Text style={s.body}>
              If an account exists for <Text style={s.email}>{email.trim()}</Text>, a link to reset
              your password is on its way. It can take a few minutes to arrive.
            </Text>
            <Text style={s.tip}>Nothing there? Check your spam folder.</Text>
          </View>

          <View style={s.actions}>
            <Button
              label="Proceed to change password"
              onPress={() =>
                router.push({ pathname: '/resetpassword', params: { email: email.trim() } })
              }
            />
            <Button
              label={cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend link'}
              variant="secondary"
              disabled={cooldown > 0}
              loading={loading}
              onPress={sendLink}
            />
            <Button label="Use a different email" variant="link" onPress={useAnotherEmail} />
            <Button label="Back to log in" variant="link" onPress={() => router.replace('/login')} />
          </View>
        </>
      ) : (
        <>
          <AuthHeader
            icon="lock-reset"
            title="Reset your password"
            subtitle="Enter the email you signed up with and we'll send you a link to choose a new password."
          />

          <AuthInput
            label="Email"
            icon="email-outline"
            placeholder="name@example.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(undefined);
            }}
            error={error}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            returnKeyType="send"
            onSubmitEditing={sendLink}
          />

          <View style={s.actions}>
            <Button label="Send reset link" onPress={sendLink} loading={loading} />
            <Button label="Back to log in" variant="link" onPress={() => goBack(router)} />
          </View>
        </>
      )}
    </AuthScreen>
  );
}

const s = StyleSheet.create({
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 24 },
  email: { color: colors.text, fontWeight: '600' },
  tip: { color: colors.textFaint, fontSize: 14, marginTop: 12 },
  actions: { marginTop: 28, gap: 12 },
});
