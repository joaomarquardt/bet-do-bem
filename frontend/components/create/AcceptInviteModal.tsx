import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { creationSuccessModalStyles as styles } from '@/styles/components/creationSuccessModal.styles';

const c = Colors.dark;

type InviteKind = 'BET' | 'CHALLENGE';

const TITLE: Record<InviteKind, string> = {
  BET: 'Aposta aceita!',
  CHALLENGE: 'Desafio aceito!',
};

const SUBTITLE: Record<InviteKind, string> = {
  BET: 'A aposta começa agora. Boa sorte!',
  CHALLENGE: 'O desafio começa agora. Mostre do que você é capaz!',
};

type AcceptInviteModalProps = {
  kind: InviteKind | null;
  onDismiss: () => void;
};

export function AcceptInviteModal({ kind, onDismiss }: AcceptInviteModalProps) {
  const visible = kind != null;

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
            <Ionicons name="trophy" size={56} color={c.accent} />
          </View>
          <Text style={[styles.title, { color: c.text }]}>
            {kind != null ? TITLE[kind] : ''}
          </Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {kind != null ? SUBTITLE[kind] : ''}
          </Text>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.okBtn,
              { backgroundColor: c.accent, opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <Text style={[styles.okBtnText, { color: '#000' }]}>Vamos lá!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
