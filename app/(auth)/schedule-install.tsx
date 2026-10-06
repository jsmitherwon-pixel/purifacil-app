import { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { useSettings } from '@/lib/store';

const DAYS_AHEAD = 14;
const START_OFFSET = 1; // start from tomorrow

type DayEntry = { key: string; day: number; month: number; year: number; weekday: number; iso: string };

function daysList(from: Date): DayEntry[] {
  const list: DayEntry[] = [];
  for (let i = START_OFFSET; i < START_OFFSET + DAYS_AHEAD; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const weekday = d.getDay();
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    list.push({ key: iso, day, month, year, weekday, iso });
  }
  return list;
}

type Slot = 'morning' | 'afternoon';

export default function ScheduleInstall() {
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ planId?: string; mode?: string }>();
  const lang = useSettings((s) => s.language);
  const monthKeys = ['month.jan', 'month.feb', 'month.mar', 'month.apr', 'month.may', 'month.jun', 'month.jul', 'month.aug', 'month.sep', 'month.oct', 'month.nov', 'month.dec'];
  const weekdayKeys = ['weekday.sun', 'weekday.mon', 'weekday.tue', 'weekday.wed', 'weekday.thu', 'weekday.fri', 'weekday.sat'];

  const days = useMemo(() => daysList(new Date()), []);
  const [selectedDay, setSelectedDay] = useState(days[1].key);
  const [slot, setSlot] = useState<Slot>('morning');

  const selectedEntry = days.find((d) => d.key === selectedDay);

  const onConfirm = () => {
    router.push({
      pathname: '/(auth)/signup-done',
      params: {
        ...params,
        installDate: selectedDay,
        installSlot: slot,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel={t('action.back')}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.title} accessibilityRole="header">{t('schedule.title')}</Text>
        <Text style={styles.subtitle}>{t('schedule.subtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{t('schedule.pickDay')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {days.map((d) => {
            const selected = d.key === selectedDay;
            return (
              <Pressable
                key={d.key}
                onPress={() => setSelectedDay(d.key)}
                style={[styles.dayCard, selected && styles.dayCardSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${t(weekdayKeys[d.weekday])} ${d.day} ${t(monthKeys[d.month - 1])}`}
              >
                <Text style={[styles.dayWeekday, selected && styles.dayTextSelected]}>
                  {t(weekdayKeys[d.weekday])}
                </Text>
                <Text style={[styles.dayNum, selected && styles.dayTextSelected]}>{d.day}</Text>
                <Text style={[styles.dayMonth, selected && styles.dayTextSelectedMuted]}>
                  {t(monthKeys[d.month - 1])}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>{t('schedule.pickSlot')}</Text>
        <View style={styles.slotSection} accessibilityRole="radiogroup">
          {(['morning', 'afternoon'] as Slot[]).map((s) => {
            const active = slot === s;
            return (
              <Pressable
                key={s}
                onPress={() => setSlot(s)}
                style={[styles.slotCard, active && styles.slotCardSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t(`schedule.${s}`)}
              >
                <Ionicons
                  name={s === 'morning' ? 'sunny-outline' : 'partly-sunny-outline'}
                  size={24}
                  color={active ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.slotName, active && { color: colors.primary, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold }]}>
                  {t(`schedule.${s}.name`)}
                </Text>
                <Text style={[styles.slotRange, active && { color: colors.primary }]}>
                  {t(`schedule.${s}.range`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedEntry && (
          <View style={styles.summary}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.summaryText}>
              {t('schedule.summary', {
                weekday: t(weekdayKeys[selectedEntry.weekday]),
                day: selectedEntry.day,
                month: t(monthKeys[selectedEntry.month - 1]),
                slot: t(`schedule.${slot}.name`),
                range: t(`schedule.${slot}.range`),
              })}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label={t('action.confirm')} onPress={onConfirm} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.xl, gap: spacing.sm },
  title: { fontSize: fontSize.xxl, fontFamily: fontFamily.bold, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.sm },
  subtitle: { fontSize: fontSize.md, color: colors.textMuted },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  daysRow: { gap: spacing.sm, paddingRight: spacing.xl },
  dayCard: {
    width: 68,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    gap: 2,
  },
  dayCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayWeekday: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dayNum: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.text,
  },
  dayMonth: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  dayTextSelected: { color: colors.textInverse },
  dayTextSelectedMuted: { color: colors.textInverse, opacity: 0.85 },
  slotSection: { flexDirection: 'row', gap: spacing.md },
  slotCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: spacing.xs,
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  slotName: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
    color: colors.text,
    textAlign: 'center',
  },
  slotRange: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  summary: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
  },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.surfaceAlt },
});
