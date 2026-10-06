import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';

type Props = {
  daysUntilService: number;
  totalCycleDays: number;
  label: string;
  daysLabel: string;
};

function healthFor(daysUntilService: number, totalCycleDays: number) {
  const pctRemaining = Math.max(0, Math.min(1, daysUntilService / totalCycleDays));
  if (pctRemaining > 0.5) return { tone: 'good' as const, color: colors.success, bg: colors.successBg };
  if (pctRemaining > 0.2) return { tone: 'ok' as const, color: colors.warning, bg: colors.warningBg };
  return { tone: 'urgent' as const, color: colors.danger, bg: colors.dangerBg };
}

export function FilterHealth({ daysUntilService, totalCycleDays, label, daysLabel }: Props) {
  const clamped = Math.max(0, Math.min(daysUntilService, totalCycleDays));
  const pctRemaining = clamped / totalCycleDays;
  const { color, bg } = healthFor(clamped, totalCycleDays);
  const barWidth = `${Math.round(pctRemaining * 100)}%` as const;

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: bg }]}>
          <Ionicons name="water" size={24} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.numRow}>
            <Text style={styles.days}>{clamped}</Text>
            <Text style={styles.daysUnit}>{daysLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: barWidth, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: 2,
  },
  days: {
    fontSize: fontSize.display,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.text,
    lineHeight: 40,
  },
  daysUnit: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
