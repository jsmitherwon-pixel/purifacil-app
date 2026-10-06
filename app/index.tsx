import { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, fontWeight, spacing } from '@/lib/theme';
import { useAuth } from '@/lib/store';

export default function Index() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const isHydrated = useAuth((s) => s.isHydrated);

  const pulse = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fade, pulse]);

  useEffect(() => {
    if (!isHydrated) return;
    const t = setTimeout(() => {
      router.replace(user ? '/(main)/home' : '/(auth)/login');
    }, 800);
    return () => clearTimeout(t);
  }, [user, isHydrated, router]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.35] });

  return (
    <View style={styles.wrap}>
      <StatusBar style="light" />
      <View style={styles.bgLayer1} />
      <View style={styles.bgLayer2} />

      <Animated.View style={[styles.center, { opacity: fade }]}>
        <View style={styles.iconOuter}>
          <Animated.View
            style={[styles.iconGlow, { opacity: glowOpacity, transform: [{ scale }] }]}
          />
          <View style={styles.iconInner}>
            <Ionicons name="water" size={56} color={colors.textInverse} />
          </View>
        </View>
        <Text style={styles.brand}>Purifácil</Text>
        <Text style={styles.tagline}>Agua pura, directo de tu llave</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dot} />
        <View style={[styles.dot, { opacity: 0.6 }]} />
        <View style={[styles.dot, { opacity: 0.3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgLayer1: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primaryDark,
    opacity: 0.35,
  },
  bgLayer2: {
    position: 'absolute',
    bottom: -160,
    left: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: colors.primaryLight,
    opacity: 0.15,
  },
  center: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconOuter: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.textInverse,
  },
  iconInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  brand: {
    fontSize: fontSize.display,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textInverse,
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xxxl,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textInverse,
  },
});
