import { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, KeyboardAvoidingView, Platform, TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';

type Errors = { name?: string; phone?: string; email?: string; address?: string };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name: string, phone: string, email: string, address: string, t: (k: string) => string): Errors {
  const errs: Errors = {};
  const digits = phone.replace(/\D/g, '');
  if (name.trim().length < 3) errs.name = t('contact.error.name');
  if (digits.length < 10) errs.phone = t('contact.error.phone');
  if (!emailRegex.test(email.trim())) errs.email = t('contact.error.email');
  if (address.trim().length < 8) errs.address = t('contact.error.address');
  return errs;
}

export default function ContactInfo() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ planId?: string; mode?: string }>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});

  const errors = useMemo(
    () => validate(name, phone, email, address, t),
    [name, phone, email, address, t]
  );
  const canContinue = Object.keys(errors).length === 0;

  const onContinue = () => {
    if (!canContinue) {
      setShowErrors(true);
      return;
    }
    router.push({
      pathname: '/(auth)/schedule-install',
      params: { ...params, name, phone, email, address },
    });
  };

  const errorOf = (key: keyof Errors) => (showErrors || touched[key] ? errors[key] : undefined);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityLabel={t('action.back')}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.title} accessibilityRole="header">{t('contact.title')}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Field
            label={t('contact.name')}
            value={name}
            onChangeText={setName}
            onBlur={() => setTouched((s) => ({ ...s, name: true }))}
            placeholder={t('contact.name.placeholder')}
            textContentType="name"
            autoCapitalize="words"
            error={errorOf('name')}
          />
          <Field
            label={t('contact.phone')}
            value={phone}
            onChangeText={setPhone}
            onBlur={() => setTouched((s) => ({ ...s, phone: true }))}
            placeholder={t('contact.phone.placeholder')}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            error={errorOf('phone')}
          />
          <Field
            label={t('contact.email')}
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched((s) => ({ ...s, email: true }))}
            placeholder={t('contact.email.placeholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            error={errorOf('email')}
          />
          <Field
            label={t('contact.address')}
            value={address}
            onChangeText={setAddress}
            onBlur={() => setTouched((s) => ({ ...s, address: true }))}
            placeholder={t('contact.address.placeholder')}
            textContentType="fullStreetAddress"
            autoCapitalize="sentences"
            multiline
            error={errorOf('address')}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button label={t('action.continue')} onPress={onContinue} disabled={showErrors && !canContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoCorrect?: boolean;
  textContentType?: TextInputProps['textContentType'];
  multiline?: boolean;
  error?: string;
};

function Field({ label, error, multiline, ...rest }: FieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          multiline && { height: 88, textAlignVertical: 'top', paddingTop: spacing.md },
          error && styles.inputError,
        ]}
        multiline={multiline}
        accessibilityLabel={label}
        accessibilityHint={error}
      />
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.xl, gap: spacing.md },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, fontWeight: fontWeight.bold, color: colors.text },
  scroll: { padding: spacing.xl, gap: spacing.md, paddingTop: 0 },
  label: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  errorRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: { fontSize: fontSize.xs, color: colors.danger, flex: 1 },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.surfaceAlt },
});
