import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/Toast';
import { colors, fonts, radius } from '@/constants/civic';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/* -------------------------------------------------------------------------- */
/* Layout                                                                      */
/* -------------------------------------------------------------------------- */

export function AuthScreen({
  children,
  topBar,
}: {
  children: React.ReactNode;
  topBar?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {topBar}
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.column}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ToastHost />
    </SafeAreaView>
  );
}

export function TopBar({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.topBar}>
      <Pressable
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => [s.iconButton, pressed && s.pressed]}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

export function AuthHeader({
  title,
  subtitle,
  icon = 'map-marker-check',
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
}) {
  return (
    <View style={s.header}>
      <View style={s.mark}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.accentInk} />
      </View>
      <Text style={s.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Road-marking motif                                                          */
/* -------------------------------------------------------------------------- */

export function DashedLine({
  color = colors.accentDim,
  dashes = 12,
  style,
}: {
  color?: string;
  dashes?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[s.dashRow, style]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: dashes }, (_, i) => (
        <View key={i} style={[s.dash, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <View style={s.divider}>
      <DashedLine style={s.flex} dashes={10} />
      <Text style={s.dividerText}>{label}</Text>
      <DashedLine style={s.flex} dashes={10} />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Buttons and links                                                           */
/* -------------------------------------------------------------------------- */

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'link';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
  accessibilityHint,
}: ButtonProps) {
  const inactive = !!(disabled || loading);
  const textColor =
    variant === 'primary' ? colors.accentInk : variant === 'link' ? colors.textMuted : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      style={({ pressed }) => [
        s.button,
        variant === 'primary' && s.buttonPrimary,
        variant === 'secondary' && s.buttonSecondary,
        variant === 'link' && s.buttonLink,
        inactive && s.disabled,
        pressed && s.buttonPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={textColor}
              style={s.buttonIcon}
            />
          ) : null}
          <Text style={[s.buttonText, { color: textColor }, variant === 'link' && s.buttonTextLink]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function GoogleButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Button label={label} icon="google" variant="secondary" onPress={onPress} />;
}

export function LinkText({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Text style={s.linkText} onPress={onPress} accessibilityRole="link">
      {children}
    </Text>
  );
}

export function FooterPrompt({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${prompt} ${action}`}
      style={s.footerPrompt}
    >
      <Text style={s.footerPromptText}>
        {prompt} <Text style={s.footerPromptAction}>{action}</Text>
      </Text>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Form fields                                                                 */
/* -------------------------------------------------------------------------- */

export function FieldError({ message }: { message: string }) {
  return (
    <View style={s.errorRow} accessibilityLiveRegion="polite">
      <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
      <Text style={s.errorText}>{message}</Text>
    </View>
  );
}

type AuthInputProps = TextInputProps & {
  label: string;
  hint?: string;
  icon: IconName;
  error?: string;
  right?: React.ReactNode;
};

export const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInput(
  { label, hint, icon, error, right, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.accent : colors.border;

  return (
    <View style={s.field}>
      <View style={s.labelRow}>
        <Text style={s.label}>{label}</Text>
        {hint ? <Text style={s.hint}>{hint}</Text> : null}
      </View>
      <View style={[s.inputBox, { borderColor }]}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={focused ? colors.accent : colors.textFaint}
          style={s.leftIcon}
        />
        <TextInput
          ref={ref}
          style={s.input}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.accent}
          accessibilityLabel={label}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {right}
      </View>
      {error ? <FieldError message={error} /> : null}
    </View>
  );
});

export const PasswordInput = forwardRef<
  TextInput,
  Omit<AuthInputProps, 'icon' | 'right' | 'secureTextEntry'>
>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <AuthInput
      {...props}
      ref={ref}
      icon="lock-outline"
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      right={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        >
          <MaterialCommunityIcons
            name={visible ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color={colors.textMuted}
          />
        </Pressable>
      }
    />
  );
});

/** A field that looks like AuthInput but opens a picker when tapped. */
export function AuthSelect({
  label,
  hint,
  icon,
  value,
  placeholder,
  error,
  onPress,
}: {
  label: string;
  hint?: string;
  icon: IconName;
  value: string;
  placeholder: string;
  error?: string;
  onPress: () => void;
}) {
  return (
    <View style={s.field}>
      <View style={s.labelRow}>
        <Text style={s.label}>{label}</Text>
        {hint ? <Text style={s.hint}>{hint}</Text> : null}
      </View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        style={({ pressed }) => [
          s.inputBox,
          { borderColor: error ? colors.danger : colors.border },
          pressed && s.pressed,
        ]}
      >
        <MaterialCommunityIcons name={icon} size={20} color={colors.textFaint} style={s.leftIcon} />
        <Text style={[s.selectText, !value && { color: colors.textFaint }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={22} color={colors.textMuted} />
      </Pressable>
      {error ? <FieldError message={error} /> : null}
    </View>
  );
}

/** Bottom sheet with a list of choices. */
export function OptionSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string;
  onSelect: (option: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Close">
        <Pressable
          style={[s.sheet, { paddingBottom: insets.bottom + 12 }]}
          onPress={() => {}}
          accessibilityViewIsModal
        >
          <View style={s.grabber} />
          <Text style={s.sheetTitle} accessibilityRole="header">
            {title}
          </Text>
          <ScrollView style={s.sheetList}>
            {options.map((option) => {
              const active = option === selected;
              return (
                <Pressable
                  key={option}
                  onPress={() => onSelect(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [s.option, pressed && s.pressed]}
                >
                  <Text style={[s.optionText, active && { color: colors.accent }]}>{option}</Text>
                  {active ? (
                    <MaterialCommunityIcons name="check" size={20} color={colors.accent} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */

const s = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  column: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: { marginTop: 16, marginBottom: 24 },
  mark: {
    width: 48,
    height: 48,
    borderRadius: radius.tile,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: { color: colors.textMuted, fontSize: 15, lineHeight: 22, marginTop: 8 },

  dashRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dash: { width: 6, height: 2, borderRadius: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerText: { color: colors.textMuted, fontSize: 13, marginHorizontal: 12 },

  button: {
    minHeight: 52,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonLink: { minHeight: 44 },
  buttonPressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  buttonIcon: { marginRight: 8 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  buttonTextLink: { fontSize: 15, fontWeight: '600' },

  linkText: { color: colors.accent, fontWeight: '600', textDecorationLine: 'underline' },
  footerPrompt: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  footerPromptText: { color: colors.textMuted, fontSize: 15 },
  footerPromptAction: { color: colors.accent, fontWeight: '700' },

  field: { marginBottom: 18 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  label: { color: colors.text, fontSize: 14, fontWeight: '600' },
  hint: { color: colors.textFaint, fontSize: 12 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radius.field,
    paddingHorizontal: 14,
  },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 12 },
  selectText: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 14 },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  errorText: { color: colors.danger, fontSize: 13, marginLeft: 6, flex: 1 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  sheetTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sheetList: { flexGrow: 0 },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: { color: colors.text, fontSize: 16, flex: 1, paddingRight: 12 },
});
