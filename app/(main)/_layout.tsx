import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily, fontSize, fontWeight } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { invoices } from '@/lib/mockData';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_BAR_CONTENT_HEIGHT = 56;
const TAB_BAR_TOP_PADDING = 6;
const TAB_BAR_BOTTOM_GAP = 6;

function tabIcon(base: string) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <Ionicons
      name={(focused ? base : `${base}-outline`) as IconName}
      size={size}
      color={color}
    />
  );
}

export default function MainLayout() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const hasPending = invoices.some((i) => i.status === 'pending');

  // Add the OS navigation-bar inset as PADDING (not margin) so the tab-bar
  // background keeps painting to the physical edge on Android edge-to-edge
  // and only the icons/labels lift above the gesture pill / 3-button nav.
  const tabBarBottomPadding = Math.max(insets.bottom, TAB_BAR_BOTTOM_GAP);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.surfaceAlt,
          backgroundColor: colors.bg,
          height: TAB_BAR_CONTENT_HEIGHT + tabBarBottomPadding,
          paddingTop: TAB_BAR_TOP_PADDING,
          paddingBottom: tabBarBottomPadding,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontFamily: fontFamily.medium,
          fontWeight: fontWeight.medium,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: tabIcon('home'),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: t('tabs.billing'),
          tabBarIcon: tabIcon('card'),
          tabBarBadge: hasPending ? '' : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.warning,
            minWidth: 10,
            maxHeight: 10,
            borderRadius: 5,
            marginLeft: -4,
          },
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: t('tabs.support'),
          tabBarIcon: tabIcon('chatbubbles'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: tabIcon('person'),
        }}
      />
    </Tabs>
  );
}
