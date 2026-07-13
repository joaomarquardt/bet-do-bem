import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const c = Colors.dark;

export interface ActionFeedbackModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'warning';
  onClose: () => void;
}

export function ActionFeedbackModal({ visible, title, message, type = 'error', onClose }: ActionFeedbackModalProps) {
  const iconName = type === 'error' ? 'close-circle-outline' : type === 'success' ? 'checkmark-circle-outline' : 'warning-outline';
  const iconColor = type === 'error' ? c.danger : type === 'success' ? c.accent : c.warning;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ionicons name={iconName} size={48} color={iconColor} style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text style={[styles.modalTitle, { color: c.text }]}>{title}</Text>
          <Text style={[styles.modalMessage, { color: c.textSecondary }]}>{message}</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.modalBtn,
              { backgroundColor: type === 'error' ? c.dangerDim : type === 'success' ? c.accentDim : c.warningDim, opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Text style={[styles.modalBtnText, { color: type === 'error' ? c.danger : type === 'success' ? c.accent : c.warning }]}>Entendi</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
