import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PurchaseCard } from '@/components/PurchaseCard';
import { Pagination } from '@/components/Pagination';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { colors, fontFamily, fontSize, fontWeight, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

const PAGE_SIZE = 6;

function formatDateNumeric(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function PurchasesList() {
  const t = useT();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useAsync(
    () => api.purchases.list(page, PAGE_SIZE),
    [page]
  );

  const visibleCount = data?.items.length ?? 0;
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const totalNoun = total === 1 ? t('purchases.noun.singular') : t('purchases.noun.plural');
  const visibleNoun = visibleCount === 1 ? t('purchases.itemNoun.singular') : t('purchases.itemNoun.plural');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">{t('purchases.title')}</Text>
          {data && (
            <Text style={styles.subtitle}>
              {t('purchases.totalLabel', { count: total, noun: totalNoun })}
            </Text>
          )}
        </View>

        {loading && !data ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={96} />
            <Skeleton height={96} />
            <Skeleton height={96} />
          </View>
        ) : error && !data ? (
          <Card>
            <View style={styles.errorRow}>
              <Ionicons name="cloud-offline-outline" size={32} color={colors.textMuted} />
              <Text style={styles.errorText}>{t('common.load.error')}</Text>
              <Button label={t('action.retry')} variant="secondary" onPress={refetch} />
            </View>
          </Card>
        ) : data && data.total === 0 ? (
          <Card>
            <EmptyState icon="bag-handle-outline" message={t('purchases.empty.title')} />
            <Text style={styles.emptySub}>{t('purchases.empty.subtitle')}</Text>
            <Button
              label={t('purchases.empty.cta')}
              onPress={() => router.push('/(auth)/plan-select')}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ) : data ? (
          <>
            <Text style={styles.visibleLabel}>
              {t('purchases.visibleLabel', { count: visibleCount, noun: visibleNoun })}
            </Text>
            <View style={{ gap: spacing.md }}>
              {data.items.map((p) => (
                <PurchaseCard
                  key={p.id}
                  purchase={p}
                  formatDate={formatDateNumeric}
                  onPress={() => router.push(`/(main)/profile/purchases/${p.id}` as never)}
                />
              ))}
            </View>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, gap: spacing.md },
  header: { gap: spacing.xs },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: { fontSize: fontSize.md, color: colors.textMuted },
  visibleLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorRow: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  errorText: { fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
  emptySub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.md,
  },
});
