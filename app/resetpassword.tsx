import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AuthHeader,
  AuthScreen,
  Button,
  FieldError,
  PasswordInput,
  TopBar,
} from '@/components/auth/ui';
import { colors, goBack } from '@/constants/civic';

const REDIRECT_MS = 2000;

type Errors = { password?: string; confirm?: string; form?: string };

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const confirmRef = useRef<TextInput>(null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // After a successful change, send the user to the login screen.
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => router.replace('/login'), REDIRECT_MS);
    return () => clearTimeout(id);
  }, [done, router]);

  const clear = (key: keyof Errors) =>
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));

  const handleChange = async () => {
    const next: Errors = {};
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (confirm !== password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      // TODO: replace with your real "change password" request.
      // In production this must send a reset token (from the emailed link) that your
      // backend verifies, otherwise anyone could change any account's password.
      await new Promise((resolve) => setTimeout(resolve, 700));
      setDone(true);
    } catch {
      setErrors({ form: "We couldn't change your password. Try again in a moment." });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthScreen>
        <AuthHeader icon="check-circle-outline" title="Password updated" />
        <View accessibilityLiveRegion="polite">
          <Text style={s.body}>
            Your password has been changed. Taking you to log in…
          </Text>
        </View>
        <View style={s.actions}>
          <Button label="Log in now" onPress={() => router.replace('/login')} />
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen topBar={<TopBar onBack={() => goBack(router)} />}>
      <AuthHeader
        icon="lock-reset"
        title="Choose a new password"
        subtitle={
          email
            ? `Set a new password for ${email}.`
            : 'Set a new password for your account.'
        }
      />

      <PasswordInput
        label="New password"
        hint="8 characters or more"
        placeholder="Create a new password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          clear('password');
        }}
        error={errors.password}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => confirmRef.current?.focus()}
      />

      <PasswordInput
        ref={confirmRef}
        label="Confirm new password"
        placeholder="Type it again"
        value={confirm}
        onChangeText={(t) => {
          setConfirm(t);
          clear('confirm');
        }}
        error={errors.confirm}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleChange}
      />

      {errors.form ? (
        <View style={s.formError}>
          <FieldError message={errors.form} />
        </View>
      ) : null}

      <View style={s.actions}>
        <Button label="Change password" onPress={handleChange} loading={loading} />
        <Button label="Back to log in" variant="link" onPress={() => router.replace('/login')} />
      </View>
    </AuthScreen>
  );
}

const s = StyleSheet.create({
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 24 },
  formError: { marginBottom: 12 },
  actions: { marginTop: 12, gap: 12 },
});
