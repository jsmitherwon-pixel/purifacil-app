import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Button } from '@/components/Button';
import { colors, fontFamily, fontSize, fontWeight, radius, spacing } from '@/lib/theme';
import { useT } from '@/lib/i18n';

type Props = {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'danger';
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  body,
  confirmLabel,
  confirmVariant = 'primary',
  cancelLabel,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const t = useT();
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
          {body ? <Text style={styles.body}>{body}</Text> : null}
          <View style={styles.actions}>
            <Button
              label={cancelLabel ?? t('action.cancel')}
              variant="secondary"
              onPress={onCancel}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <Button
              label={confirmLabel}
              variant={confirmVariant}
              onPress={onConfirm}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,37,69,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold, fontWeight: fontWeight.bold,
    color: colors.text,
  },
  body: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    lineHeight: 22,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
