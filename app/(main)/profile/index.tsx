import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { useAuth, useSettings } from '@/lib/store';

export default function Profile() {
  const t = useT();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const language = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);
  const tabBarHeight = useBottomTabBarHeight();

  if (!user) return null;

  const confirmLogout = () => {
    Alert.alert(
      t('profile.logout.confirm.title'),
      t('profile.logout.confirm.body'),
      [
        { text: t('action.cancel'), style: 'cancel' },
        { text: t('profile.logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  const editAddress = () => {
    Alert.alert(t('comingSoon'), t('profile.address.edit.soon'));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title={t('profile.title')} />

        <Card>
          <View style={styles.userRow}>
            <View style={styles.avatar} accessibilityLabel={user.name}>
              <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userId}>{t('profile.account')} · {user.id}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.blockTitle}>{t('profile.address')}</Text>
        <Pressable
          onPress={editAddress}
          accessibilityRole="button"
          accessibilityHint={t('profile.address.edit.soon')}
        >
          <Card>
            <View style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.actionText} numberOfLines={3}>{user.address}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </Card>
        </Pressable>

        <NavigationRow
          icon="card-outline"
          title={t('profile.paymentMethods')}
          subtitle={t('profile.paymentMethods.subtitle')}
          onPress={() => router.push('/(main)/profile/payment-methods')}
        />
        <NavigationRow
          icon="bag-handle-outline"
          title={t('profile.purchases')}
          subtitle={t('profile.purchases.subtitle')}
          onPress={() => router.push('/(main)/profile/purchases')}
        />

        <Text style={styles.blockTitle}>{t('profile.language')}</Text>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <LangRow
            label={t('lang.es')}
            active={language === 'es'}
            onPress={() => setLanguage('es')}
          />
          <View style={styles.rowDivider} />
          <LangRow
            label={t('lang.en')}
            active={language === 'en'}
            onPress={() => setLanguage('en')}
          />
        </Card>

        <Button
          label={t('profile.logout')}
          variant="secondary"
          onPress={confirmLogout}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function NavigationRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      <Card>
        <View style={styles.actionRow}>
          <View style={styles.actionIcon}>
            <Ionicons name={icon} size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  );
}

function LangRow({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.langRow}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.langLabel, active && { color: colors.primary, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold }]}>
        {label}
      </Text>
      {active && <Ionicons name="checkmark" size={20} color={colors.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, gap: spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.textInverse,
  },
  userName: { fontSize: fontSize.lg, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, color: colors.text },
  userEmail: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  userId: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  blockTitle: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1, fontSize: fontSize.md, color: colors.text, lineHeight: 22 },
  actionTitle: { fontSize: fontSize.md, fontFamily: fontFamily.semibold, fontWeight: fontWeight.semibold, color: colors.text },
  actionSubtitle: { marginTop: 2, fontSize: fontSize.sm, color: colors.textMuted },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  langLabel: { fontSize: fontSize.md, color: colors.text },
  rowDivider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: spacing.lg,
  },
});
