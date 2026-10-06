import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { BrandLogo } from '@/components/BrandLogo';
import { StatusPill } from '@/components/StatusPill';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import type { PaymentMethod } from '@/lib/api';

type Mode = 'full' | 'radio' | 'compact';

type Props = {
  method: PaymentMethod;
  mode?: Mode;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function PaymentMethodCard({ method, mode = 'full', selected, onSelect, onEdit, onDelete }: Props) {
  const t = useT();
  const expires = t('payments.expires', {
    mm: String(method.expMonth).padStart(2, '0'),
    yyyy: String(method.expYear),
  });

  const inner = (
    <View style={styles.headerRow}>
      <BrandLogo brand={method.brand} />
      <View style={{ flex: 1 }}>
        <Text style={styles.holder}>{method.holderName}</Text>
        <Text style={styles.number}>•••• •••• •••• {method.last4}</Text>
        <Text style={styles.expires}>{expires}</Text>
      </View>
      {method.isDefault && mode !== 'compact' && (
        <StatusPill label={t('payments.default')} tone="info" />
      )}
      {mode === 'radio' && (
        <View
          style={[styles.radio, selected && styles.radioSelected]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {selected && <Ionicons name="checkmark" size={14} color={colors.textInverse} />}
        </View>
      )}
    </View>
  );

  if (mode === 'radio') {
    return (
      <Pressable
        onPress={onSelect}
        accessibilityRole="radio"
        accessibilityState={{ selected: !!selected }}
        accessibilityLabel={`${method.brand} •••• ${method.last4}`}
      >
        <Card style={[styles.radioCard, selected && styles.radioCardSelected]}>{inner}</Card>
      </Pressable>
    );
  }

  if (mode === 'compact') {
    return <Card>{inner}</Card>;
  }

  return (
    <Card>
      {inner}
      <View style={styles.actionsRow}>
        <Button label={t('payments.edit')} variant="secondary" onPress={onEdit} style={{ flex: 1 }} />
        <Button label={t('payments.delete')} variant="danger" onPress={onDelete} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  holder: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  number: { marginTop: 2, fontSize: fontSize.sm, color: colors.textMuted, letterSpacing: 1 },
  expires: { marginTop: 2, fontSize: fontSize.xs, color: colors.textMuted },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  radioCard: { borderWidth: 1, borderColor: colors.surfaceAlt },
  radioCardSelected: { borderColor: colors.primary, borderWidth: 2 },
});
