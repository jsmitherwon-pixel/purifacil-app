import { useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, StyleProp, Animated } from 'react-native';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.base,
          variantStyles[variant],
          variant === 'primary' && !isDisabled && styles.primaryShadow,
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'whatsapp' ? colors.textInverse : colors.primary}
          />
        ) : (
          <Text style={[styles.label, variantLabelStyles[variant]]}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.4,
  },
  primaryShadow: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  whatsapp: {
    backgroundColor: colors.whatsapp,
  },
  danger: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
};

const variantLabelStyles: Record<Variant, { color: string }> = {
  primary: { color: colors.textInverse },
  secondary: { color: colors.text },
  ghost: { color: colors.primary },
  whatsapp: { color: colors.textInverse },
  danger: { color: colors.danger },
};
