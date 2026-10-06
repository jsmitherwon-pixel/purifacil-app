import { Stack } from 'expo-router';
import { colors, fontFamily, fontWeight } from '@/lib/theme';
import { useT } from '@/lib/i18n';

export default function ProfileStackLayout() {
  const t = useT();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: fontFamily.semibold,
          fontWeight: fontWeight.semibold,
        },
        headerShadowVisible: false,
        headerBackTitle: t('action.back'),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="payment-methods/index" options={{ title: t('payments.title') }} />
      <Stack.Screen name="payment-methods/new" options={{ title: t('payments.new.title') }} />
      <Stack.Screen name="payment-methods/[id]/edit" options={{ title: t('payments.edit.title') }} />
      <Stack.Screen name="purchases/index" options={{ title: t('purchases.title') }} />
      <Stack.Screen name="purchases/[id]" options={{ title: t('purchases.details') }} />
    </Stack>
  );
}
