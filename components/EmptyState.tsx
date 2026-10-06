import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, spacing } from '@/lib/theme';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
};

export function EmptyState({ icon = 'file-tray-outline', message }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={styles.msg}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  msg: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
