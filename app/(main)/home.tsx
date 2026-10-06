import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Pressable, ActivityIndicator, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { StatusPill } from '@/components/StatusPill';
import { FilterHealth } from '@/components/FilterHealth';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { useAuth, useSettings } from '@/lib/store';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

function daysBetween(iso: string): number {
  const target = new Date(iso + 'T00:00:00Z');
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((target.getTime() - todayUtc) / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string, lang: 'es' | 'en'): string {
  const d = new Date(iso + 'T00:00:00Z');
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  const monthsEs = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = lang === 'en' ? monthsEn : monthsEs;
  return `${day} ${months[month]} ${year}`;
}

export default function Home() {
  const t = useT();
  const user = useAuth((s) => s.user);
  const lang = useSettings((s) => s.language);
  const tabBarHeight = useBottomTabBarHeight();
  const subscriptionAsync = useAsync(() => api.subscription.get(), []);
  const plansAsync = useAsync(() => api.plans.list(), []);
  const subscription = subscriptionAsync.data;
  const plans = plansAsync.data;
  const plan = subscription && plans ? plans.find((p) => p.id === subscription.planId) : null;

  const cycleLength = 180;
  const daysUntil = subscription ? daysBetween(subscription.nextServiceDate) : 0;
  const loading = (subscriptionAsync.loading || plansAsync.loading) && !subscription;
  const error = (subscriptionAsync.error || plansAsync.error) && !subscription;

  const requestEarly = () => Alert.alert(t('early.requested'));

  // Header height is measured on layout so the ScrollView's paddingTop
  // always matches the real hero height + status-bar inset (no magic numbers).
  const [heroHeight, setHeroHeight] = useState(0);
  const onHeroLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h !== heroHeight) setHeroHeight(h);
  };

  return (
    <View style={styles.root}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
          <Text style={styles.errorText}>{t('common.load.error')}</Text>
          <Button
            label={t('action.retry')}
            variant="secondary"
            onPress={() => {
              subscriptionAsync.refetch();
              plansAsync.refetch();
            }}
          />
        </View>
      ) : subscription && plan ? (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: heroHeight + spacing.md,
              paddingBottom: tabBarHeight + spacing.lg,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <FilterHealth
              daysUntilService={daysUntil}
              totalCycleDays={cycleLength}
              label={t('home.service.title')}
              daysLabel={lang === 'en' ? 'days' : 'días'}
            />
            <View style={styles.healthDivider} />
            <View style={styles.healthMeta}>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>{t('home.service.cartridge')}</Text>
                <Text style={styles.metaValue} numberOfLines={2}>
                  {lang === 'en' ? subscription.nextCartridgeEn : subscription.nextCartridge}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>{lang === 'en' ? 'Scheduled' : 'Programado'}</Text>
                <Text style={styles.metaValue}>{formatDate(subscription.nextServiceDate, lang)}</Text>
              </View>
            </View>
            <Pressable
              onPress={requestEarly}
              accessibilityRole="button"
              accessibilityLabel={t('home.service.requestEarly')}
              style={({ pressed }) => [styles.earlyBtn, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="flash" size={16} color={colors.primary} />
              <Text style={styles.earlyBtnText}>{t('home.service.requestEarly')}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </Card>

          <Card>
            <View style={styles.cardTitleRow}>
              <View style={styles.miniIcon}>
                <Ionicons name="cube-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{t('home.plan.title')}</Text>
              <StatusPill label={plan.tech} tone="info" />
            </View>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${subscription.monthlyPrice}</Text>
              <Text style={styles.priceUnit}>{t('plan.perMonth')}</Text>
            </View>
          </Card>

          <Card>
            <View style={styles.cardTitleRow}>
              <View style={styles.miniIcon}>
                <Ionicons name="construct-outline" size={18} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{t('home.install.title')}</Text>
            </View>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.metaLabel}>{t('home.install.date')}</Text>
                <Text style={styles.metaValue}>{formatDate(subscription.installDate, lang)}</Text>
              </View>
              <View style={styles.techWrap}>
                <View style={styles.techAvatar}>
                  <Text style={styles.techAvatarText}>
                    {subscription.technicianName.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>{t('home.install.tech')}</Text>
                  <Text style={styles.metaValue}>{subscription.technicianName}</Text>
                </View>
              </View>
            </View>
          </Card>
        </ScrollView>
      ) : null}

      {/* Header rendered AFTER the scroll so it sits on top in z-order. */}
      <View style={styles.hero} onLayout={onHeroLayout}>
        <SafeAreaView edges={['top']} style={styles.heroSafe}>
          <View style={styles.heroBgBlob} />
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>
                {t('home.greeting')}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </Text>
              <Text style={styles.brandOnHero}>Purifácil</Text>
            </View>
            {subscription && (
              <View style={styles.statusChip}>
                <View style={styles.statusDot} />
                <Text style={styles.statusChipText}>
                  {subscription.status === 'active' ? t('home.plan.active') : t('home.plan.paused')}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    // Elevation so the header sits above the ScrollView on Android too.
    elevation: 4,
    zIndex: 4,
  },
  heroSafe: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  heroBgBlob: {
    position: 'absolute',
    right: -60,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primaryDark,
    opacity: 0.4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.textInverse,
    opacity: 0.85,
  },
  brandOnHero: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.textInverse,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusChipText: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textInverse,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  errorText: { fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
  healthDivider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
    marginVertical: spacing.md,
  },
  healthMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  earlyBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  earlyBtnText: {
    color: colors.primary,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  miniIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  planName: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  price: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  priceUnit: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginLeft: 4,
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  techWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  techAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techAvatarText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  metaLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.xs,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
  },
});
