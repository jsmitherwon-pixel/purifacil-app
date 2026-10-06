import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily, fontWeight, radius } from '@/lib/theme';
import type { CardBrand } from '@/lib/api';

type Props = {
  brand: CardBrand;
  size?: 'sm' | 'md';
};

const palette: Record<CardBrand, { bg: string; fg: string; label: string; italic: boolean }> = {
  visa: { bg: '#1A1F71', fg: '#F6C445', label: 'VISA', italic: true },
  mastercard: { bg: '#111827', fg: '#FFFFFF', label: 'MC', italic: false },
  amex: { bg: '#2E77BB', fg: '#FFFFFF', label: 'AMEX', italic: false },
  unknown: { bg: '#475569', fg: '#FFFFFF', label: '••••', italic: false },
};

export function BrandLogo({ brand, size = 'md' }: Props) {
  const info = palette[brand];
  const dims = size === 'sm' ? { width: 40, height: 26, font: 10 } : { width: 52, height: 34, font: 13 };

  return (
    <View
      style={[
        styles.wrap,
        { width: dims.width, height: dims.height, backgroundColor: info.bg },
      ]}
      accessibilityLabel={info.label}
    >
      {brand === 'mastercard' ? (
        <View style={styles.mcRow}>
          <View style={[styles.mcCircle, { backgroundColor: '#EB001B' }]} />
          <View style={[styles.mcCircle, { backgroundColor: '#F79E1B', marginLeft: -6 }]} />
        </View>
      ) : brand === 'unknown' ? (
        <Ionicons name="card" size={dims.font + 4} color={info.fg} />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: info.fg,
              fontSize: dims.font,
              fontStyle: info.italic ? 'italic' : 'normal',
            },
          ]}
        >
          {info.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
  },
  mcRow: { flexDirection: 'row', alignItems: 'center' },
  mcCircle: { width: 14, height: 14, borderRadius: 7 },
});
