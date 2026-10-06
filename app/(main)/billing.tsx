import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { StatusPill } from '@/components/StatusPill';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useSettings } from '@/lib/store';

const monthKeysEs = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const monthKeysEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: string, lang: 'es' | 'en'): string {
  const d = new Date(iso + 'T00:00:00Z');
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  const months = lang === 'en' ? monthKeysEn : monthKeysEs;
  return `${day} ${months[month]} ${year}`;
}

export default function Billing() {
  const t = useT();
  const lang = useSettings((s) => s.language);
  const tabBarHeight = useBottomTabBarHeight();
  const { data: invoices, loading, error, refetch } = useAsync(() => api.invoices.list(), []);
  const pending = invoices?.find((i) => i.status === 'pending');
  const history = (invoices ?? []).filter((i) => i.status === 'paid');
  const [methodExpanded, setMethodExpanded] = useState(false);

  if (loading && !invoices) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !invoices) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
          <Text style={styles.errorText}>{t('common.load.error')}</Text>
          <Button label={t('action.retry')} variant="secondary" onPress={refetch} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title={t('billing.title')} />

        {pending ? (
          <Card style={{ backgroundColor: colors.primary, borderColor: 'transparent' }}>
            <Text style={styles.nextChargeLabel}>{t('billing.nextCharge')}</Text>
            <View style={styles.priceRow}>
              <Text
                style={styles.nextChargeAmount}
                accessibilityLabel={`$${pending.amount} MXN`}
              >
                ${pending.amount}
              </Text>
              <Text style={styles.nextChargeUnit}>MXN</Text>
            </View>
            <Text style={styles.nextChargeDate}>{formatDate(pending.date, lang)}</Text>
          </Card>
        ) : (
          <Card style={{ backgroundColor: colors.successBg, borderColor: 'transparent' }}>
            <View style={styles.upToDateRow}>
              <Ionicons name="checkmark-circle" size={28} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.upToDateTitle}>{t('billing.upToDate.title')}</Text>
                <Text style={styles.upToDateSubtitle}>{t('billing.upToDate.subtitle')}</Text>
              </View>
            </View>
          </Card>
        )}

        <Pressable
          onPress={() => setMethodExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityHint={t('billing.paymentMethod.comingSoon')}
        >
          <Card style={styles.methodRow}>
            <View style={styles.methodLeft}>
              <View style={styles.methodIconWrap}>
                <Ionicons name="card" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodLabel}>{t('billing.paymentMethod')}</Text>
                <Text style={styles.methodValue}>{t('billing.paymentMethod.value')}</Text>
              </View>
            </View>
            <Ionicons name={methodExpanded ? 'chevron-up' : 'chevron-forward'} size={20} color={colors.textMuted} />
          </Card>
        </Pressable>
        {methodExpanded && (
          <View style={styles.methodComingSoon}>
            <Ionicons name="time-outline" size={16} color={colors.textMuted} />
            <Text style={styles.methodComingSoonText}>{t('billing.paymentMethod.comingSoon')}</Text>
          </View>
        )}

        <Text style={styles.historyTitle}>{t('billing.history')}</Text>
        {history.length > 0 ? (
          <View style={{ gap: spacing.sm }}>
            {history.map((inv) => (
              <Card key={inv.id} style={styles.invoiceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invoiceId}>{inv.id}</Text>
                  <Text style={styles.invoiceDate}>{formatDate(inv.date, lang)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                  <Text style={styles.invoiceAmount}>${inv.amount}</Text>
                  <StatusPill
                    label={inv.status === 'paid' ? t('billing.status.paid') : t('billing.status.pending')}
                    tone={inv.status === 'paid' ? 'success' : 'warning'}
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card>
            <View style={styles.historyEmpty}>
              <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyEmptyTitle}>{t('billing.empty.title')}</Text>
                <Text style={styles.historyEmptySubtitle}>{t('billing.empty.subtitle')}</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, gap: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  errorText: { fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
  nextChargeLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textInverse,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.sm },
  nextChargeAmount: {
    fontSize: fontSize.display,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.textInverse,
  },
  nextChargeUnit: {
    fontSize: fontSize.md,
    color: colors.textInverse,
    opacity: 0.85,
    marginLeft: spacing.sm,
    marginBottom: 8,
  },
  nextChargeDate: {
    fontSize: fontSize.md,
    color: colors.textInverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  upToDateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  upToDateTitle: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, color: colors.success },
  upToDateSubtitle: { marginTop: 2, fontSize: fontSize.sm, color: colors.text },
  methodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  methodValue: { fontSize: fontSize.md, color: colors.text, marginTop: 2, fontFamily: fontFamily.medium, fontWeight: fontWeight.medium },
  methodComingSoon: {
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  methodComingSoonText: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted },
  historyTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  historyEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  historyEmptyTitle: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, color: colors.text },
  historyEmptySubtitle: { marginTop: 2, fontSize: fontSize.sm, color: colors.textMuted },
  invoiceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  invoiceId: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, color: colors.text },
  invoiceDate: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  invoiceAmount: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, color: colors.text },
});
