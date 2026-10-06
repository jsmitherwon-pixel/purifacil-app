import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/lib/store';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

const monthKeys = ['month.jan', 'month.feb', 'month.mar', 'month.apr', 'month.may', 'month.jun', 'month.jul', 'month.aug', 'month.sep', 'month.oct', 'month.nov', 'month.dec'];

function formatIso(iso: string, t: (k: string) => string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${t(monthKeys[m - 1])} ${y}`;
}

export default function SignupDone() {
  const t = useT();
  const login = useAuth((s) => s.login);
  const params = useLocalSearchParams<{
    planId?: string;
    mode?: string;
    installDate?: string;
    installSlot?: string;
  }>();
  const { data: plans } = useAsync(() => api.plans.list(), []);
  const plan = plans?.find((p) => p.id === params.planId);
  const modeLabel = params.mode ? t(`plan.${params.mode}`) : null;
  const dateLabel = params.installDate ? formatIso(params.installDate, t) : null;
  const slotLabel = params.installSlot ? t(`schedule.${params.installSlot}.name`) : null;
  const slotRange = params.installSlot ? t(`schedule.${params.installSlot}.range`) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={96} color={colors.success} accessibilityLabel={t('signup.done.title')} />
        </View>
        <Text style={styles.title} accessibilityRole="header">{t('signup.done.title')}</Text>
        <Text style={styles.subtitle}>{t('signup.done.subtitle')}</Text>

        {(plan || dateLabel) && (
          <Card style={styles.summary}>
            <Text style={styles.summaryTitle}>{t('signup.done.summary')}</Text>
            {plan && (
              <SummaryRow icon="cube-outline" label={t('home.plan.title')} value={plan.name} />
            )}
            {modeLabel && (
              <SummaryRow icon="card-outline" label={t('plan.paymentMode')} value={modeLabel} />
            )}
            {dateLabel && (
              <SummaryRow icon="calendar-outline" label={t('home.install.date')} value={dateLabel} />
            )}
            {slotLabel && (
              <SummaryRow
                icon={params.installSlot === 'morning' ? 'sunny-outline' : 'partly-sunny-outline'}
                label={t('schedule.slot')}
                value={`${slotLabel} · ${slotRange}`}
              />
            )}
          </Card>
        )}

        <View style={styles.footer}>
          <Button label={t('signup.done.goHome')} onPress={login} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing.xl, alignItems: 'center' },
  iconWrap: { marginTop: spacing.xxxl, marginBottom: spacing.lg },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  summary: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rowValue: {
    marginTop: 2,
    fontSize: fontSize.md,
    color: colors.text,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
  },
  footer: { position: 'absolute', bottom: spacing.xl, left: spacing.xl, right: spacing.xl },
});
