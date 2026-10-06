import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, shadow, spacing } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
};

export function Card({ children, style, elevated }: Props) {
  return (
    <View style={[styles.card, elevated ? shadow.cardHigh : shadow.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
});
