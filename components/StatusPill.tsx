import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type Props = {
  label: string;
  tone?: Tone;
};

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  info: { bg: colors.infoBg, fg: colors.info },
  neutral: { bg: colors.surface, fg: colors.textMuted },
};

export function StatusPill({ label, tone = 'neutral' }: Props) {
  const { bg, fg } = toneStyles[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
  },
});
