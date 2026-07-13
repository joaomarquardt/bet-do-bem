import { View, Text, Pressable, ActivityIndicator, Modal } from 'react-native';
import Colors from '@/constants/colors';
import { groupStyles as styles } from './MyGroupsSection.styles';

const c = Colors.dark;

interface RemoveMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName?: string;
  isLoading: boolean;
}

export function RemoveMemberModal({
  visible,
  onClose,
  onConfirm,
  memberName,
  isLoading,
}: RemoveMemberModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.modalTitle, { color: c.text }]}>Remover Membro</Text>
          
          <Text style={{ fontSize: 16, fontFamily: 'Inter_400Regular', color: c.textSecondary, textAlign: 'center', marginBottom: 24 }}>
            Tem certeza que deseja remover {memberName} do grupo?
          </Text>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalCancelBtn,
                { borderColor: c.border, backgroundColor: pressed ? c.background : 'transparent' },
              ]}
            >
              <Text style={[styles.modalBtnText, { color: c.text }]}>Cancelar</Text>
            </Pressable>
            
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalConfirmBtn,
                { backgroundColor: c.danger, opacity: pressed || isLoading ? 0.7 : 1 },
              ]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Remover</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
