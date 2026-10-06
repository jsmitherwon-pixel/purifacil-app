import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize, fontWeight, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { useAuth, useSettings } from '@/lib/store';
import { openWhatsApp } from '@/lib/whatsapp';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

export default function Support() {
  const t = useT();
  const user = useAuth((s) => s.user);
  const lang = useSettings((s) => s.language);
  const tabBarHeight = useBottomTabBarHeight();
  const { data: faqEntries, loading: faqLoading, error: faqError, refetch: faqRefetch } = useAsync(
    () => api.faq.list(lang),
    [lang]
  );
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIdx(openIdx === i ? null : i);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title={t('support.title')} />

        <WhatsAppButton
          title={t('support.whatsappCta')}
          subtitle={t('support.whatsappSubtitle')}
          hint={t('support.whatsappHint')}
          onPress={() => openWhatsApp(lang === 'en' ? 'General support' : 'Soporte general', user)}
        />

        <Text style={styles.blockTitle}>{t('support.faq')}</Text>
        {faqLoading && !faqEntries ? (
          <View style={styles.faqLoading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : faqError && !faqEntries ? (
          <View style={styles.faqError}>
            <Text style={styles.faqErrorText}>{t('common.load.error')}</Text>
            <Button label={t('action.retry')} variant="secondary" onPress={faqRefetch} />
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {(faqEntries ?? []).map((entry, i) => {
              const isOpen = openIdx === i;
              const q = t(entry.q);
              const a = t(entry.a);
              return (
                <Card key={entry.q} style={{ padding: 0 }}>
                  <Pressable
                    onPress={() => toggle(i)}
                    style={styles.faqHeader}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    accessibilityLabel={q}
                  >
                    <Text style={styles.faqQ}>{q}</Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </Pressable>
                  {isOpen && (
                    <View style={styles.faqBody}>
                      <Text style={styles.faqA}>{a}</Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, gap: spacing.md },
  blockTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  faqQ: { flex: 1, fontSize: fontSize.md, fontFamily: fontFamily.medium, fontWeight: fontWeight.medium, color: colors.text },
  faqBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  faqA: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
  },
  faqLoading: { paddingVertical: spacing.xl, alignItems: 'center' },
  faqError: { paddingVertical: spacing.xl, alignItems: 'center', gap: spacing.md },
  faqErrorText: { fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
});
