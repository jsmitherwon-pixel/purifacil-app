import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { api, type Plan } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useSettings } from '@/lib/store';

type PaymentMode = 'subscription' | 'finance' | 'purchase';

export default function PlanSelect() {
  const t = useT();
  const router = useRouter();
  const lang = useSettings((s) => s.language);
  const { recommendedPlanId } = useLocalSearchParams<{ zip?: string; recommendedPlanId?: string }>();

  const { data: plans, loading, error, refetch } = useAsync(() => api.plans.list(), []);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [mode, setMode] = useState<PaymentMode>('subscription');

  useEffect(() => {
    if (plans && !selectedPlan) {
      const rec = plans.find((p) => p.id === recommendedPlanId) ?? plans[0];
      setSelectedPlan(rec);
    }
  }, [plans, recommendedPlanId, selectedPlan]);

  const priceFor = (plan: Plan, m: PaymentMode) => {
    if (m === 'subscription') return `$${plan.subscription}${t('plan.perMonth')}`;
    if (m === 'finance') return `$${plan.finance}${t('plan.perMonth')} · ${plan.financeMonths} ${t('plan.months')}`;
    return `$${plan.purchase.toLocaleString('es-MX')}`;
  };

  const onContinue = () => {
    if (!selectedPlan) return;
    router.push({
      pathname: '/(auth)/contact-info',
      params: { planId: selectedPlan.id, mode },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel={t('action.back')}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">{t('plan.title')}</Text>
        <Text style={styles.subtitle}>{t('plan.subtitle')}</Text>
      </View>

      {loading && !plans ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error && !plans ? (
        <View style={styles.errorWrap}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
          <Text style={styles.errorTitle}>{t('common.load.error')}</Text>
          <Button label={t('action.retry')} onPress={refetch} variant="secondary" />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View>
              <Text style={styles.sectionLabel}>{t('plan.paymentMode')}</Text>
              <View style={styles.modeSection} accessibilityRole="radiogroup">
                {(['subscription', 'finance', 'purchase'] as PaymentMode[]).map((m) => {
                  const active = mode === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMode(m)}
                      style={[styles.modeChip, active && styles.modeChipActive]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={t(`plan.${m}`)}
                    >
                      <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                        {t(`plan.${m}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.modeHelper}>{t(`plan.${mode}.helper`)}</Text>
            </View>

            <View style={{ gap: spacing.md, marginTop: spacing.md }} accessibilityRole="radiogroup">
              <Text style={styles.sectionLabel}>{t('plan.systems')}</Text>
              {(plans ?? []).map((p) => {
                const isSelected = p.id === selectedPlan?.id;
                const isRecommended = p.id === recommendedPlanId;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelectedPlan(p)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={p.name}
                  >
                    <Card
                      style={[
                        styles.planCard,
                        isSelected && { borderColor: colors.primary, borderWidth: 2 },
                      ]}
                    >
                      <View style={styles.planHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.planName}>{p.name}</Text>
                          {isRecommended && (
                            <View style={styles.recommendedPill}>
                              <Text style={styles.recommendedPillText}>{t('plan.recommended')}</Text>
                            </View>
                          )}
                        </View>
                        <View style={[styles.radio, isSelected && styles.radioSelected]}>
                          {isSelected && <Ionicons name="checkmark" size={16} color={colors.textInverse} />}
                        </View>
                      </View>
                      <Text style={styles.planDesc}>
                        {lang === 'en' ? p.descriptionEn : p.description}
                      </Text>
                      <Text style={styles.planPrice}>{priceFor(p, mode)}</Text>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button label={t('action.continue')} onPress={onContinue} disabled={!selectedPlan} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.xl, gap: spacing.sm },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.sm },
  subtitle: { fontSize: fontSize.md, color: colors.textMuted },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  errorTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  modeSection: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeChipText: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, fontWeight: fontWeight.medium, color: colors.text },
  modeChipTextActive: { color: colors.textInverse },
  modeHelper: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  planCard: { gap: spacing.sm },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  planName: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, color: colors.text },
  planDesc: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  planPrice: { fontSize: fontSize.xl, fontFamily: fontFamily.bold, fontWeight: fontWeight.bold, color: colors.primary, marginTop: spacing.sm },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  recommendedPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  recommendedPillText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
  },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.surfaceAlt },
});
