import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';

type Props = {
  title: string;
  subtitle?: string;
  hint?: string;
  onPress: () => void;
};

export function WhatsAppButton({ title, subtitle, hint, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={title}
      accessibilityHint={hint}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="logo-whatsapp" size={28} color={colors.textInverse} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.textInverse} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.whatsapp,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textInverse,
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
  },
  subtitle: {
    color: colors.textInverse,
    fontSize: fontSize.sm,
    opacity: 0.9,
  },
});
