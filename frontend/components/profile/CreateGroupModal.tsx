import { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import { groupService } from '@/lib/api/group.service';
import { groupStyles as styles } from './MyGroupsSection.styles';

const c = Colors.dark;

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

export function CreateGroupModal({ visible, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do grupo é obrigatório.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Erro', 'A descrição do grupo é obrigatória.');
      return;
    }

    setIsCreating(true);
    try {
      await groupService.createGroup({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      onGroupCreated();
      onClose();
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Não foi possível criar o grupo.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.modalTitle, { color: c.text }]}>Criar Grupo</Text>

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>Nome</Text>
          <TextInput
            style={[styles.textInput, { borderColor: c.border, color: c.text, backgroundColor: c.surfaceElevated }]}
            placeholder="Nome do grupo"
            placeholderTextColor={c.textTertiary}
            value={name}
            onChangeText={setName}
            maxLength={50}
          />

          <Text style={[styles.inputLabel, { color: c.textSecondary }]}>Descrição</Text>
          <TextInput
            style={[styles.textInput, { borderColor: c.border, color: c.text, backgroundColor: c.surfaceElevated, minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Descrição do grupo"
            placeholderTextColor={c.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />

          <View style={styles.modalActions}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [styles.modalCancelBtn, { borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.modalBtnText, { color: c.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              disabled={isCreating}
              style={({ pressed }) => [styles.modalConfirmBtn, { backgroundColor: c.accent, opacity: pressed || isCreating ? 0.7 : 1 }]}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={[styles.modalBtnText, { color: '#000' }]}>Criar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
