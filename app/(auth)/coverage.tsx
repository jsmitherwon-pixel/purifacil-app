import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { normalizeZip } from '@/lib/coverage';
import { api, type CoverageResult, type Plan } from '@/lib/api';
import { useSettings } from '@/lib/store';

type Result = (CoverageResult & { zip: string; recommendedPlan?: Plan }) | null;

export default function Coverage() {
  const t = useT();
  const router = useRouter();
  const lang = useSettings((s) => s.language);
  const [zip, setZip] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySent, setNotifySent] = useState(false);

  const reset = () => {
    setResult(null);
    setNotifySent(false);
    setErrorMsg(null);
  };

  const onCheck = async () => {
    const normalized = normalizeZip(zip);
    if (normalized.length !== 5) return;
    setChecking(true);
    setErrorMsg(null);
    try {
      const coverage = await api.coverage.check(normalized);
      let recommendedPlan: Plan | undefined;
      if (coverage.recommendedPlanId) {
        const list = await api.plans.list();
        recommendedPlan = list.find((p) => p.id === coverage.recommendedPlanId);
      }
      setResult({ ...coverage, zip: normalized, recommendedPlan });
    } catch {
      setErrorMsg(t('coverage.error'));
    } finally {
      setChecking(false);
    }
  };

  const onContinue = () => {
    if (result?.covered) {
      router.push({
        pathname: '/(auth)/plan-select',
        params: { zip: result.zip, recommendedPlanId: result.recommendedPlanId ?? '' },
      });
    }
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail.trim());
  const onNotify = () => {
    if (!emailValid) return;
    setNotifySent(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={12}
            accessibilityLabel={t('action.back')}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">{t('coverage.title')}</Text>
            <Text style={styles.subtitle}>{t('coverage.subtitle')}</Text>
          </View>

          <View>
            <Text style={styles.label}>{t('coverage.zip')}</Text>
            <TextInput
              value={zip}
              onChangeText={(v) => {
                setZip(normalizeZip(v));
                reset();
              }}
              keyboardType="number-pad"
              maxLength={5}
              style={styles.input}
              placeholder={t('coverage.zipPlaceholder')}
              placeholderTextColor={colors.textMuted}
              accessibilityLabel={t('coverage.zip')}
              textContentType="postalCode"
            />
          </View>

          <Button
            label={t('coverage.check')}
            onPress={onCheck}
            loading={checking}
            disabled={zip.length !== 5}
          />

          {errorMsg && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {result && (
            <Card style={{ backgroundColor: result.covered ? colors.successBg : colors.warningBg, borderColor: 'transparent' }}>
              <View style={styles.resultRow}>
                <Ionicons
                  name={result.covered ? 'checkmark-circle' : 'location-outline'}
                  size={28}
                  color={result.covered ? colors.success : colors.warning}
                />
                <Text style={[styles.resultText, { color: result.covered ? colors.success : colors.warning }]}>
                  {result.covered ? t('coverage.covered') : t('coverage.notCovered')}
                </Text>
              </View>
              {result.covered && result.recommendedPlan && (
                <View style={styles.recommendation}>
                  <Text style={styles.recommendationLabel}>{t('plan.recommended')}</Text>
                  <Text style={styles.recommendationName}>{result.recommendedPlan.name}</Text>
                  <Text style={styles.recommendationDesc}>
                    {lang === 'en' ? result.recommendedPlan.descriptionEn : result.recommendedPlan.description}
                  </Text>
                </View>
              )}
              {!result.covered && !notifySent && (
                <View style={styles.notifyBlock}>
                  <Text style={styles.notifyHelper}>{t('coverage.notifyHelper')}</Text>
                  <TextInput
                    value={notifyEmail}
                    onChangeText={setNotifyEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.notifyInput}
                    placeholder={t('coverage.emailPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    textContentType="emailAddress"
                    accessibilityLabel={t('contact.email')}
                  />
                </View>
              )}
              {!result.covered && notifySent && (
                <View style={styles.notifySentRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.notifySentText}>{t('coverage.notifySavedFor', { email: notifyEmail })}</Text>
                </View>
              )}
            </Card>
          )}

          <View style={{ marginTop: 'auto', gap: spacing.md, paddingTop: spacing.lg }}>
            {result?.covered ? (
              <Button label={t('action.continue')} onPress={onContinue} />
            ) : result && !result.covered && !notifySent ? (
              <Button
                label={t('coverage.notifyMe')}
                variant="secondary"
                onPress={onNotify}
                disabled={!emailValid}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: spacing.xl, gap: spacing.lg },
  backBtn: { alignSelf: 'flex-start' },
  header: { marginTop: spacing.sm },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { marginTop: spacing.xs, fontSize: fontSize.md, color: colors.textMuted },
  label: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: 2,
    textAlign: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    flex: 1,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  resultText: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, flex: 1 },
  recommendation: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  recommendationLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendationName: {
    marginTop: spacing.xs,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  recommendationDesc: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  notifyBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    gap: spacing.sm,
  },
  notifyHelper: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  notifyInput: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  notifySentRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notifySentText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
  },
});
