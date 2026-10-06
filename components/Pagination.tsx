import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onChange }: Props) {
  const t = useT();
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Render up to 3 numeric buttons centered on the current page.
  const start = Math.max(1, Math.min(page - 1, totalPages - 2));
  const end = Math.min(totalPages, start + 2);
  const nums: number[] = [];
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      <NavButton
        icon="play-skip-back"
        disabled={!canPrev}
        onPress={() => onChange(1)}
        label={t('pagination.first')}
      />
      <NavButton
        icon="chevron-back"
        disabled={!canPrev}
        onPress={() => onChange(page - 1)}
        label={t('pagination.prev')}
      />
      {nums.map((n) => {
        const active = n === page;
        return (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={[styles.numBtn, active && styles.numBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={t('pagination.goTo', { page: n })}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.numText, active && styles.numTextActive]}>{n}</Text>
          </Pressable>
        );
      })}
      <NavButton
        icon="chevron-forward"
        disabled={!canNext}
        onPress={() => onChange(page + 1)}
        label={t('pagination.next')}
      />
      <NavButton
        icon="play-skip-forward"
        disabled={!canNext}
        onPress={() => onChange(totalPages)}
        label={t('pagination.last')}
      />
    </View>
  );
}

function NavButton({
  icon,
  disabled,
  onPress,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  disabled: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[styles.navBtn, disabled && styles.navBtnDisabled]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={16} color={disabled ? colors.textMuted : colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  numBtn: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  numText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  numTextActive: { color: colors.textInverse },
});
