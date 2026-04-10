import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import type { ContentKind } from '@/components/create/CreateContentModal';
import { creationSuccessModalStyles as styles } from '@/styles/components/creationSuccessModal.styles';

const c = Colors.dark;

const MESSAGES: Record<ContentKind, string> = {
  BET: 'A aposta foi criada com sucesso.',
  CHALLENGE: 'O desafio foi criado com sucesso.',
  ACTIVITY: 'A atividade foi criada com sucesso.',
};

type CreationSuccessModalProps = {
  kind: ContentKind | null;
  onDismiss: () => void;
};

export function CreationSuccessModal({ kind, onDismiss }: CreationSuccessModalProps) {
  const visible = kind != null;
  const title = kind != null ? MESSAGES[kind] : '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onDismiss} accessibilityRole="button" />
        <View
          style={[
            styles.card,
            {
              backgroundColor: c.surfaceElevated,
              borderColor: c.border,
            },
          ]}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={56} color={c.accent} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            Agora seus amigos podem ver e participar!
          </Text>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.okBtn,
              { backgroundColor: c.accent, opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <Text style={[styles.okBtnText, { color: '#000' }]}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
