import { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, KeyboardAvoidingView, Platform, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';
import { api, type CardBrand } from '@/lib/api';

const BRANDS: CardBrand[] = ['visa', 'mastercard', 'amex'];

const brandLabel = (b: CardBrand) =>
  b === 'visa' ? 'Visa' : b === 'mastercard' ? 'Mastercard' : b === 'amex' ? 'American Express' : 'Otra';

type Errors = { holder?: string; last4?: string; expMonth?: string; expYear?: string };

function validate(holder: string, last4: string, month: string, year: string, t: (k: string) => string): Errors {
  const errs: Errors = {};
  if (holder.trim().length < 3) errs.holder = t('payments.error.holder');
  if (!/^\d{4}$/.test(last4)) errs.last4 = t('payments.error.last4');
  const m = Number(month);
  if (!Number.isFinite(m) || m < 1 || m > 12) errs.expMonth = t('payments.error.expMonth');
  const y = Number(year);
  const thisYear = new Date().getUTCFullYear();
  if (!Number.isFinite(y) || y < thisYear) errs.expYear = t('payments.error.expYear');
  return errs;
}

export default function PaymentMethodsNew() {
  const t = useT();
  const router = useRouter();
  const [holder, setHolder] = useState('');
  const [brand, setBrand] = useState<CardBrand>('visa');
  const [last4, setLast4] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [setDefault, setSetDefault] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = useMemo(
    () => validate(holder, last4, expMonth, expYear, t),
    [holder, last4, expMonth, expYear, t]
  );
  const canSave = Object.keys(errors).length === 0;

  const onSave = async () => {
    if (!canSave) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    try {
      await api.paymentMethods.add({
        holderName: holder.trim(),
        brand,
        last4,
        expMonth: Number(expMonth),
        expYear: Number(expYear),
        setAsDefault: setDefault,
      });
      setSaving(false);
      Alert.alert(t('payments.saved'));
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={styles.demoText}>{t('payments.demoNote')}</Text>
          </View>

          <Field
            label={t('payments.field.holder')}
            value={holder}
            onChangeText={setHolder}
            placeholder={t('payments.field.holder.placeholder')}
            autoCapitalize="words"
            textContentType="name"
            error={showErrors ? errors.holder : undefined}
          />

          <View>
            <Text style={styles.label}>{t('payments.field.brand')}</Text>
            <View style={styles.brandRow} accessibilityRole="radiogroup">
              {BRANDS.map((b) => {
                const active = b === brand;
                return (
                  <Pressable
                    key={b}
                    onPress={() => setBrand(b)}
                    style={[styles.brandChip, active && styles.brandChipActive]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={brandLabel(b)}
                  >
                    <Text style={[styles.brandChipText, active && styles.brandChipTextActive]}>
                      {brandLabel(b)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Field
            label={t('payments.field.last4')}
            value={last4}
            onChangeText={(v) => setLast4(v.replace(/\D/g, '').slice(0, 4))}
            placeholder="5868"
            keyboardType="number-pad"
            maxLength={4}
            error={showErrors ? errors.last4 : undefined}
          />

          <View style={styles.expRow}>
            <View style={{ flex: 1 }}>
              <Field
                label={t('payments.field.expMonth')}
                value={expMonth}
                onChangeText={(v) => setExpMonth(v.replace(/\D/g, '').slice(0, 2))}
                placeholder="08"
                keyboardType="number-pad"
                maxLength={2}
                error={showErrors ? errors.expMonth : undefined}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label={t('payments.field.expYear')}
                value={expYear}
                onChangeText={(v) => setExpYear(v.replace(/\D/g, '').slice(0, 4))}
                placeholder={String(new Date().getUTCFullYear() + 2)}
                keyboardType="number-pad"
                maxLength={4}
                error={showErrors ? errors.expYear : undefined}
              />
            </View>
          </View>

          <View style={styles.defaultRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.defaultLabel}>{t('payments.field.setDefault')}</Text>
            </View>
            <Switch
              value={setDefault}
              onValueChange={setSetDefault}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={setDefault ? colors.primary : colors.surface}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label={t('action.save')} onPress={onSave} loading={saving} disabled={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  textContentType?: 'name' | 'creditCardNumber';
  maxLength?: number;
  error?: string;
};

function Field({ label, error, ...rest }: FieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && styles.inputError]}
        accessibilityLabel={label}
        accessibilityHint={error}
      />
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xl },
  demoBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.infoBg,
  },
  demoText: { flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
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
  brandRow: { flexDirection: 'row', gap: spacing.sm },
  brandChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  brandChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  brandChipText: { fontSize: fontSize.sm, fontFamily: fontFamily.medium, fontWeight: fontWeight.medium, color: colors.text },
  brandChipTextActive: { color: colors.textInverse },
  expRow: { flexDirection: 'row', gap: spacing.md },
  defaultRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  defaultLabel: {
    fontSize: fontSize.md,
    color: colors.text,
    fontFamily: fontFamily.medium, fontWeight: fontWeight.medium,
  },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.surfaceAlt },
});
