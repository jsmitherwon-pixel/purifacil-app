import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PaymentMethodCard } from '@/components/PaymentMethodCard';
import { Skeleton } from '@/components/Skeleton';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { colors, fontFamily, fontSize, fontWeight, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { api, type PaymentMethod, type ApiError } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

export default function PaymentMethodsList() {
  const t = useT();
  const router = useRouter();
  const { data, loading, error, refetch } = useAsync(() => api.paymentMethods.list(), []);
  const [pending, setPending] = useState<PaymentMethod | null>(null);
  const [removing, setRemoving] = useState(false);

  const askDelete = (method: PaymentMethod) => setPending(method);

  const confirmDelete = async () => {
    if (!pending) return;
    setRemoving(true);
    try {
      await api.paymentMethods.remove(pending.id);
      setPending(null);
      setRemoving(false);
      Alert.alert(t('payments.deleted'));
      refetch();
    } catch (raw) {
      setRemoving(false);
      const err = raw as ApiError;
      if (err.code === 'CARD_LINKED_TO_SUB') {
        const linked = pending.linkedSubscriptionIds[0];
        setPending(null);
        Alert.alert(
          t('payments.delete.blocked.title'),
          t('payments.delete.blocked.body'),
          [
            { text: t('action.cancel'), style: 'cancel' },
            {
              text: t('payments.delete.blocked.goToSub'),
              onPress: () => linked && router.push(`/(main)/profile/purchases/${linked}` as never),
            },
          ]
        );
      } else {
        setPending(null);
        Alert.alert(t('common.load.error'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading && !data ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={140} />
            <Skeleton height={140} />
            <Skeleton height={140} />
          </View>
        ) : error && !data ? (
          <Card>
            <View style={styles.errorRow}>
              <Ionicons name="cloud-offline-outline" size={32} color={colors.textMuted} />
              <Text style={styles.errorText}>{t('common.load.error')}</Text>
              <Button label={t('action.retry')} variant="secondary" onPress={refetch} />
            </View>
          </Card>
        ) : data && data.length === 0 ? (
          <Card>
            <EmptyState icon="card-outline" message={t('payments.empty.title')} />
            <Text style={styles.emptySub}>{t('payments.empty.subtitle')}</Text>
            <Button
              label={t('payments.addFirstCard')}
              onPress={() => router.push('/(main)/profile/payment-methods/new')}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ) : (
          <>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }} />
              <Button
                label={t('payments.addCard')}
                onPress={() => router.push('/(main)/profile/payment-methods/new')}
                style={{ paddingHorizontal: spacing.lg }}
              />
            </View>
            <View style={{ gap: spacing.md }}>
              {data!.map((pm) => (
                <PaymentMethodCard
                  key={pm.id}
                  method={pm}
                  onEdit={() => router.push(`/(main)/profile/payment-methods/${pm.id}/edit` as never)}
                  onDelete={() => askDelete(pm)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <ConfirmModal
        visible={pending !== null}
        title={t('payments.delete.confirm.title')}
        body={pending ? t('payments.delete.confirm.body', { last4: pending.last4 }) : undefined}
        confirmLabel={t('payments.delete.confirm.cta')}
        confirmVariant="danger"
        loading={removing}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  errorRow: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  errorText: { fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
  emptySub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: -spacing.md,
  },
});
