import { Linking } from 'react-native';
import { supportPhone, type User } from './mockData';

export function buildWhatsAppUrl(topic: string, user: User | null): string {
  const parts = [
    `Hola Purifácil, soy ${user?.name ?? 'cliente'}`,
    user?.id ? `(ID: ${user.id})` : '',
    `\n\nMotivo: ${topic}`,
  ].filter(Boolean);
  const text = encodeURIComponent(parts.join(' '));
  return `https://wa.me/${supportPhone}?text=${text}`;
}

export function openWhatsApp(topic: string, user: User | null) {
  const url = buildWhatsAppUrl(topic, user);
  Linking.openURL(url).catch(() => {
    // silently ignore — WhatsApp might not be installed
  });
}
