import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/store';

export default function Login() {
  const t = useT();
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = () => {
    login();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Ionicons name="water" size={36} color={colors.textInverse} />
            </View>
            <Text style={styles.brand}>{t('app.name')}</Text>
            <Text style={styles.tagline}>{t('app.tagline')}</Text>
          </View>

          <View>
            <Text style={styles.title}>{t('auth.login.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>{t('auth.login.email')}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View>
              <Text style={styles.label}>{t('auth.login.password')}</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button label={t('auth.login.submit')} onPress={onSubmit} />
            <Pressable onPress={() => router.push('/(auth)/coverage')} style={styles.link}>
              <Text style={styles.linkText}>{t('auth.login.newCustomer')}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  brandWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.text,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  form: { gap: spacing.md },
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
  actions: { gap: spacing.md, marginTop: 'auto' },
  link: { alignItems: 'center', paddingVertical: spacing.sm },
  linkText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
  },
});
