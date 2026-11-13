import { useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AuthHeader,
  AuthInput,
  AuthScreen,
  Button,
  Divider,
  FieldError,
  FooterPrompt,
  GoogleButton,
  LinkText,
  PasswordInput,
  TopBar,
} from '@/components/auth/ui';
import { colors, enterApp, goBack } from '@/constants/civic';
import { useAuthStore } from '@/stores/useAuthStore';

type Errors = { identifier?: string; password?: string; form?: string };

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const login = useAuthStore((s) => s.login);
  const loginAsDemoGoogleUser = useAuthStore((s) => s.loginAsDemoGoogleUser);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const clear = (key: keyof Errors) => setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));

  const handleLogin = async () => {
    const next: Errors = {};
    if (!identifier.trim()) next.identifier = 'Enter your municipal ID or email.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      // SIMULATION: any ID or email and password works. Swap in your real sign-in request here.
      await new Promise((resolve) => setTimeout(resolve, 600));
      login(identifier, remember);
      enterApp(router);
    } catch {
      setErrors({ form: "We couldn't log you in. Check your details and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen topBar={<TopBar onBack={() => goBack(router)} />}>
      <AuthHeader
        title="Welcome back"
        subtitle="Log in to follow your reports and vote on neighborhood priorities."
      />

      {/* SIMULATION: signs in as a demo user. Swap in real Google sign-in later. */}
      <GoogleButton
        label="Continue with Google"
        onPress={() => {
          loginAsDemoGoogleUser();
          enterApp(router);
        }}
      />

      <Divider label="or use your municipal ID" />

      <AuthInput
        label="Municipal ID or email"
        icon="card-account-details-outline"
        placeholder="ID-9482 or name@example.com"
        value={identifier}
        onChangeText={(t) => {
          setIdentifier(t);
          clear('identifier');
        }}
        error={errors.identifier}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        keyboardType="email-address"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <PasswordInput
        ref={passwordRef}
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          clear('password');
        }}
        error={errors.password}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleLogin}
      />

      <View style={s.optionsRow}>
        <Pressable
          style={s.remember}
          onPress={() => setRemember((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: remember }}
          accessibilityLabel="Keep me logged in"
        >
          <Checkbox
            style={s.checkbox}
            value={remember}
            onValueChange={setRemember}
            color={remember ? colors.accent : colors.border}
          />
          <Text style={s.rememberText}>Keep me logged in</Text>
        </Pressable>
        <LinkText onPress={() => router.push('/forgotpassword')}>Forgot password?</LinkText>
      </View>

      {errors.form ? (
        <View style={s.formError}>
          <FieldError message={errors.form} />
        </View>
      ) : null}

      <Button label="Log in" onPress={handleLogin} loading={loading} />

      <Text style={s.demoNote}>Demo mode: any ID or email and password will log you in.</Text>

      <FooterPrompt
        prompt="New to Civic Pulse?"
        action="Create an account"
        onPress={() => router.push('/register')}
      />
    </AuthScreen>
  );
}

const s = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 2,
  },
  remember: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  checkbox: { width: 20, height: 20, borderRadius: 5, marginRight: 10 },
  rememberText: { color: colors.textMuted, fontSize: 14 },
  formError: { marginBottom: 12 },
  demoNote: { color: colors.textFaint, fontSize: 13, textAlign: 'center', marginTop: 16 },
});
