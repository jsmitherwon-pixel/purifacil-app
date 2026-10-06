import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { PaymentMethodCard } from '@/components/PaymentMethodCard';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { api, type PaymentMethod } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';

export default function PaymentMethodEdit() {
  const t = useT();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading, error, refetch } = useAsync(async () => {
    const list = await api.paymentMethods.list();
    const found = list.find((p) => p.id === id);
    if (!found) throw { status: 404, code: 'NOT_FOUND', message: 'Tarjeta no encontrada.' };
    return found;
  }, [id]);

  const [holder, setHolder] = useState('');
  const [setDefault, setSetDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (data) {
      setHolder(data.holderName);
      setSetDefault(data.isDefault);
    }
  }, [data]);

  const holderError = holder.trim().length < 3 ? t('payments.error.holder') : undefined;
  const canSave = !holderError && !!data;

  const onSave = async () => {
    if (!canSave || !id) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    try {
      await api.paymentMethods.update(id, {
        holderName: holder.trim(),
        setAsDefault: setDefault && !data!.isDefault ? true : undefined,
      });
      setSaving(false);
      Alert.alert(t('payments.updated'));
      router.back();
    } catch {
      setSaving(false);
      Alert.alert(t('common.load.error'));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {loading && !data ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error && !data ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
            <Text style={styles.errorMsg}>{t('common.load.error')}</Text>
            <Button label={t('action.retry')} variant="secondary" onPress={refetch} />
          </View>
        ) : data ? (
          <>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
              <PaymentMethodCard method={{ ...data, holderName: holder || data.holderName }} mode="compact" />

              <View>
                <Text style={styles.label}>{t('payments.field.holder')}</Text>
                <TextInput
                  value={holder}
                  onChangeText={setHolder}
                  placeholder={t('payments.field.holder.placeholder')}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, showErrors && holderError && styles.inputError]}
                  autoCapitalize="words"
                  textContentType="name"
                  accessibilityLabel={t('payments.field.holder')}
                />
                {showErrors && holderError ? (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={14} color={colors.danger} />
                    <Text style={styles.errorText}>{holderError}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.defaultRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.defaultLabel}>{t('payments.field.setDefault')}</Text>
                </View>
                <Switch
                  value={setDefault}
                  onValueChange={setSetDefault}
                  disabled={data.isDefault}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={setDefault ? colors.primary : colors.surface}
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button label={t('action.save')} onPress={onSave} loading={saving} disabled={saving} />
            </View>
          </>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  errorMsg: { fontSize: fontSize.md, color: colors.text, textAlign: 'center' },
  label: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger, backgroundColor: colors.dangerBg },
  errorRow: { marginTop: spacing.xs, flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorText: { fontSize: fontSize.xs, color: colors.danger, flex: 1 },
  defaultRow: { flexDirection: 'row', alignItems: 'center' },
  defaultLabel: {
    fontSize: fontSize.md,
    color: colors.text,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
  },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.surfaceAlt },
});
