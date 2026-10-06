import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { StatusPill } from '@/components/StatusPill';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import type { PurchaseSummary } from '@/lib/api';

type Props = {
  purchase: PurchaseSummary;
  onPress: () => void;
  formatDate: (iso: string) => string;
};

export function PurchaseCard({ purchase, onPress, formatDate }: Props) {
  const t = useT();
  const isSub = purchase.type === 'subscription';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={purchase.productName}
      accessibilityHint={t('purchases.details')}
    >
      <Card>
        <View style={styles.row}>
          <View style={styles.imageWrap}>
            {purchase.productImage ? (
              <Image source={{ uri: purchase.productImage }} style={styles.image} />
            ) : (
              <Ionicons name="cube-outline" size={30} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <StatusPill
              label={isSub ? t('purchases.badge.subscription') : t('purchases.badge.oneTime')}
              tone={isSub ? 'info' : 'neutral'}
            />
            <Text style={styles.name} numberOfLines={2}>{purchase.productName}</Text>
            <Text style={styles.date}>
              {t('purchases.purchaseDate', { date: formatDate(purchase.purchaseDate) })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  imageWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  name: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  date: { marginTop: 2, fontSize: fontSize.xs, color: colors.textMuted },
});
