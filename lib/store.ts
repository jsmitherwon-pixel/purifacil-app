import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sampleUser, sampleSubscription, type User, type Subscription } from './mockData';

type Language = 'es' | 'en';

type SettingsState = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'es',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'purifacil-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

type AuthState = {
  user: User | null;
  isHydrated: boolean;
  login: () => void;
  logout: () => void;
  setHydrated: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,
      login: () => set({ user: sampleUser }),
      logout: () => set({ user: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'purifacil-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

type SubscriptionState = {
  subscription: Subscription;
};

export const useSubscription = create<SubscriptionState>(() => ({
  subscription: sampleSubscription,
}));
