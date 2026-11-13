import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AuthHeader,
  AuthInput,
  AuthScreen,
  AuthSelect,
  Button,
  Divider,
  FieldError,
  FooterPrompt,
  GoogleButton,
  LinkText,
  OptionSheet,
  PasswordInput,
  TopBar,
} from '@/components/auth/ui';
import { colors, comingSoon, enterApp, goBack, isEmail } from '@/constants/civic';
import { useAuthStore } from '@/stores/useAuthStore';

// TODO: load the real list of municipalities from your backend.
const MUNICIPALITIES = ['Metropolis Metro District (Zone 4)', 'Riverside District', 'Lakeview District'];

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  municipality?: string;
  consent?: string;
  form?: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const signUp = useAuthStore((s) => s.signUp);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [consent, setConsent] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const clear = (key: keyof Errors) => setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));

  const handleRegister = async () => {
    const next: Errors = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter your full name.';
    if (!isEmail(email)) next.email = 'Enter a valid email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (!municipality) next.municipality = 'Choose your municipality.';
    if (!consent) next.consent = 'Accept the terms to continue.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      // TODO: replace with your real sign-up request.
      await new Promise((resolve) => setTimeout(resolve, 700));
      signUp(fullName, email);
      enterApp(router);
    } catch {
      setErrors({ form: "We couldn't create your account. Try again in a moment." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen topBar={<TopBar onBack={() => goBack(router)} />}>
      <AuthHeader
        title="Create your account"
        subtitle="Report problems, follow repairs, and vote on what your neighborhood needs first."
      />

      <GoogleButton label="Sign up with Google" onPress={() => comingSoon('Google sign-up')} />

      <Divider label="or sign up with email" />

      <AuthInput
        label="Full name"
        hint="As shown on your ID"
        icon="account-outline"
        placeholder="Jordan Mitchell"
        value={fullName}
        onChangeText={(t) => {
          setFullName(t);
          clear('fullName');
        }}
        error={errors.fullName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <AuthInput
        ref={emailRef}
        label="Email"
        icon="email-outline"
        placeholder="name@example.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          clear('email');
        }}
        error={errors.email}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <PasswordInput
        ref={passwordRef}
        label="Password"
        hint="8 characters or more"
        placeholder="Create a password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          clear('password');
        }}
        error={errors.password}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
      />

      <AuthSelect
        label="Municipality"
        icon="city-variant-outline"
        placeholder="Choose your municipality"
        value={municipality}
        error={errors.municipality}
        onPress={() => setPickerOpen(true)}
      />

      <View style={s.note}>
        <Text style={s.noteTitle}>Address check</Text>
        <Text style={s.noteBody}>
          You'll confirm your home address the first time you file a report or vote.
        </Text>
      </View>

      <Pressable
        style={s.consent}
        onPress={() => {
          setConsent((v) => !v);
          clear('consent');
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consent }}
        accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
      >
        <Checkbox
          style={s.checkbox}
          value={consent}
          onValueChange={(v) => {
            setConsent(v);
            clear('consent');
          }}
          color={consent ? colors.accent : colors.border}
        />
        <Text style={s.consentText}>
          I agree to the{' '}
          <LinkText onPress={() => comingSoon('Terms of Service')}>Terms of Service</LinkText> and{' '}
          <LinkText onPress={() => comingSoon('Privacy Policy')}>Privacy Policy</LinkText>.
        </Text>
      </Pressable>
      {errors.consent ? (
        <View style={s.consentError}>
          <FieldError message={errors.consent} />
        </View>
      ) : null}

      {errors.form ? (
        <View style={s.consentError}>
          <FieldError message={errors.form} />
        </View>
      ) : null}

      <Button label="Create account" onPress={handleRegister} loading={loading} style={s.submit} />

      <FooterPrompt
        prompt="Already have an account?"
        action="Log in"
        onPress={() => router.push('/login')}
      />

      <OptionSheet
        visible={pickerOpen}
        title="Choose your municipality"
        options={MUNICIPALITIES}
        selected={municipality}
        onClose={() => setPickerOpen(false)}
        onSelect={(option) => {
          setMunicipality(option);
          clear('municipality');
          setPickerOpen(false);
        }}
      />
    </AuthScreen>
  );
}

const s = StyleSheet.create({
  note: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 12,
    marginBottom: 22,
  },
  noteTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  noteBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: 2 },
  consent: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 44 },
  checkbox: { width: 22, height: 22, borderRadius: 6, marginRight: 12, marginTop: 1 },
  consentText: { flex: 1, color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  consentError: { marginTop: 4 },
  submit: { marginTop: 20 },
});
