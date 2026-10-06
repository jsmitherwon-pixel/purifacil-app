import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StatusPill } from '@/components/StatusPill';
import { PaymentMethodCard } from '@/components/PaymentMethodCard';
import { Skeleton } from '@/components/Skeleton';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { api, type PaymentRecord, type SubscriptionStatus } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useSettings } from '@/lib/store';

const monthKeys = ['month.jan', 'month.feb', 'month.mar', 'month.apr', 'month.may', 'month.jun', 'month.jul', 'month.aug', 'month.sep', 'month.oct', 'month.nov', 'month.dec'];

function formatFullDate(iso: string, t: (k: string) => string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${t(monthKeys[m - 1])} ${y}`;
}

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('es-MX')}`;
}

function statusTone(s: SubscriptionStatus): 'success' | 'danger' | 'warning' {
  if (s === 'active') return 'success';
  if (s === 'canceled') return 'danger';
  return 'warning'; // paused | expired
}

function paymentTone(s: PaymentRecord['status']): 'success' | 'danger' | 'warning' {
  if (s === 'paid') return 'success';
  if (s === 'failed') return 'danger';
  return 'warning'; // refunded
}

export default function PurchaseDetailScreen() {
  const t = useT();
  const router = useRouter();
  const lang = useSettings((s) => s.language);
  const tabBarHeight = useBottomTabBarHeight();
  const { id } = useLocalSearchParams<{ id: string }>();

  const purchase = useAsync(() => api.purchases.get(id!), [id]);
  const methods = useAsync(() => api.paymentMethods.list(), []);

  const currentCardId = purchase.data?.subscription?.currentPaymentMethodId ?? null;
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentCardId && selectedCardId === null) {
      setSelectedCardId(currentCardId);
    }
  }, [currentCardId, selectedCardId]);

  const p = purchase.data;
  const sub = p?.subscription;
  const isSubscription = p?.type === 'subscription';
  const canEditCard = isSubscription && sub?.status === 'active';
  const changed = canEditCard && selectedCardId !== null && selectedCardId !== currentCardId;

  const onUpdateCard = async () => {
    if (!id || !selectedCardId || !changed) return;
    setSaving(true);
    try {
      await api.purchases.updateSubscriptionCard(id, selectedCardId);
      setSaving(false);
      Alert.alert(t('purchase.changeCard.updated'));
      purchase.refetch();
      methods.refetch();
    } catch {
      setSaving(false);
      Alert.alert(t('common.load.error'));
    }
  };

  const openWarranty = () => {
    if (p?.warrantyUrl) Linking.openURL(p.warrantyUrl).catch(() => {});
  };

  if (purchase.loading && !p) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + spacing.lg }]}>
          <Skeleton height={200} />
          <Skeleton height={140} />
          <Skeleton height={200} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (purchase.error && !p) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
          <Text style={styles.errorText}>{t('common.load.error')}</Text>
          <Button label={t('action.retry')} variant="secondary" onPress={purchase.refetch} />
        </View>
      </SafeAreaView>
    );
  }

  if (!p) return null;

  const desc = lang === 'en' ? p.productDescriptionEn : p.productDescription;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product header */}
        <Card>
          <View style={styles.productHeader}>
            <View style={styles.productImage}>
              <Ionicons name="cube-outline" size={40} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <StatusPill
                label={isSubscription ? t('purchases.badge.subscription') : t('purchases.badge.oneTime')}
                tone={isSubscription ? 'info' : 'neutral'}
              />
              <Text style={styles.productName}>{p.productName}</Text>
            </View>
          </View>
          <Text style={styles.productDesc}>{desc}</Text>
          {p.warrantyUrl ? (
            <Pressable
              onPress={openWarranty}
              accessibilityRole="link"
              accessibilityLabel={t('purchase.warranty')}
              accessibilityHint={p.warrantyUrl}
            >
              <Text style={styles.warrantyLink}>{t('purchase.warranty')}</Text>
            </Pressable>
          ) : null}
        </Card>

        {/* Payment details */}
        {isSubscription && sub ? (
          <Card>
            <View style={styles.blockTitleRow}>
              <Text style={styles.blockTitle}>{t('purchase.paymentDetails')}</Text>
              <StatusPill label={t(`purchase.status.${sub.status}`)} tone={statusTone(sub.status)} />
            </View>

            <View style={styles.nextPaymentRow}>
              <Text style={styles.metaLabel}>{t('purchase.nextPayment')}</Text>
              {sub.nextPaymentDate && sub.nextPaymentAmount ? (
                <Text style={styles.metaValue}>
                  {formatFullDate(sub.nextPaymentDate, t)} · {formatMoney(sub.nextPaymentAmount)}
                </Text>
              ) : (
                <Text style={styles.metaMissing}>{t('purchase.noBillingData')}</Text>
              )}
            </View>

            <Text style={[styles.metaLabel, { marginTop: spacing.md }]}>{t('purchase.history')}</Text>
            {p.paymentHistory.length === 0 ? (
              <Text style={styles.metaMissing}>{t('purchase.history.empty')}</Text>
            ) : (
              <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
                {p.paymentHistory.map((entry) => (
                  <View key={entry.id} style={styles.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyAmount}>{formatMoney(entry.amount)}</Text>
                      <Text style={styles.historyDate}>{formatFullDate(entry.date, t)}</Text>
                    </View>
                    <StatusPill
                      label={t(`purchase.payment.${entry.status}`)}
                      tone={paymentTone(entry.status)}
                    />
                  </View>
                ))}
              </View>
            )}
          </Card>
        ) : (
          // One-time purchase summary
          <Card>
            <Text style={styles.blockTitle}>{t('purchase.paymentDetails')}</Text>
            <View style={styles.nextPaymentRow}>
              <Text style={styles.metaLabel}>{t('purchase.oneTimeAmount')}</Text>
              <Text style={styles.metaValue}>
                {p.oneTimeAmount != null ? formatMoney(p.oneTimeAmount) : t('purchase.noBillingData')}
              </Text>
            </View>
            <View style={styles.nextPaymentRow}>
              <Text style={styles.metaLabel}>{t('purchases.purchaseDate', { date: formatFullDate(p.purchaseDate, t) }).replace(/^[^:]+:\s*/, '')}</Text>
              <Text style={styles.metaValue}>{formatFullDate(p.purchaseDate, t)}</Text>
            </View>
          </Card>
        )}

        {/* Change payment method — only for active subscriptions */}
        {isSubscription && sub && (
          canEditCard ? (
            <View>
              <Text style={styles.sectionHeader}>{t('purchase.changeCard.title')}</Text>
              {methods.loading && !methods.data ? (
                <View style={{ gap: spacing.md }}>
                  <Skeleton height={80} />
                  <Skeleton height={80} />
                </View>
              ) : methods.data && methods.data.length === 0 ? (
                <Card>
                  <Text style={styles.metaMissing}>{t('purchase.changeCard.noCards')}</Text>
                </Card>
              ) : methods.data ? (
                <View style={{ gap: spacing.sm }}>
                  {methods.data.map((pm) => (
                    <PaymentMethodCard
                      key={pm.id}
                      method={pm}
                      mode="radio"
                      selected={selectedCardId === pm.id}
                      onSelect={() => setSelectedCardId(pm.id)}
                    />
                  ))}
                </View>
              ) : null}
              <View style={styles.actionsRow}>
                <Button
                  label={t('action.back')}
                  variant="secondary"
                  onPress={() => router.back()}
                  style={{ flex: 1 }}
                />
                <Button
                  label={t('purchase.changeCard.update')}
                  onPress={onUpdateCard}
                  loading={saving}
                  disabled={!changed || saving}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <Card style={{ backgroundColor: colors.warningBg, borderColor: 'transparent' }}>
              <View style={styles.blockedRow}>
                <Ionicons name="information-circle" size={22} color={colors.warning} />
                <Text style={styles.blockedText}>
                  {t('purchase.changeCard.blocked', { status: t(`purchase.status.${sub.status}`) })}
                </Text>
              </View>
            </Card>
          )
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
  productHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    marginTop: spacing.xs,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.text,
  },
  productDesc: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
  },
  warrantyLink: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  blockTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  blockTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  nextPaymentRow: { marginTop: spacing.md, gap: 2 },
  metaLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
  },
  metaMissing: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  historyAmount: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  historyDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  sectionHeader: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  blockedRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  blockedText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
