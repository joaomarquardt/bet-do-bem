import { useState, useEffect, useMemo } from 'react';
import { View, Text, Modal, Pressable, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { userService } from '@/lib/api/user.service';
import { groupService } from '@/lib/api/group.service';
import { groupStyles as styles } from './MyGroupsSection.styles';
import type { UserResponse } from '@/lib/types';

const c = Colors.dark;

interface InviteMembersModalProps {
  visible: boolean;
  onClose: () => void;
  onInvitesSent: () => void;
  groupId: number;
  existingMemberIds: number[];
}

export function InviteMembersModal({
  visible,
  onClose,
  onInvitesSent,
  groupId,
  existingMemberIds,
}: InviteMembersModalProps) {
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (visible) {
      loadUsers();
      setSelectedIds(new Set());
      setSearch('');
    }
  }, [visible]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const users = await userService.getAllUsers();
      setAllUsers(users as UserResponse[]);
    } catch (e) {
      console.error('Error loading users', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const memberSet = new Set(existingMemberIds);
    return allUsers
      .filter((u) => !memberSet.has(u.id))
      .filter((u) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
        );
      });
  }, [allUsers, existingMemberIds, search]);

  const toggleUser = (userId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSendInvites = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um usuário para convidar.');
      return;
    }
    setIsSending(true);
    try {
      await groupService.sendInvites(groupId, Array.from(selectedIds));
      Alert.alert('Sucesso', `${selectedIds.size} convite(s) enviado(s)!`);
      onInvitesSent();
      onClose();
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Não foi possível enviar os convites.');
    } finally {
      setIsSending(false);
    }
  };

  const renderUser = ({ item }: { item: UserResponse }) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <Pressable onPress={() => toggleUser(item.id)} style={styles.userListItem}>
        <Avatar name={item.fullName} color="#CCCCCC" size={36} imageUri={item.profilePictureUrl} />
        <View style={styles.userListName}>
          <Text style={[styles.userListFullName, { color: c.text }]}>{item.fullName}</Text>
          <Text style={[styles.userListUsername, { color: c.textSecondary }]}>@{item.username}</Text>
        </View>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: isSelected ? c.accent : c.textTertiary,
              backgroundColor: isSelected ? c.accent : 'transparent',
            },
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={14} color="#000" />}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.modalTitle, { color: c.text }]}>Convidar Membros</Text>

          <TextInput
            style={[styles.searchInput, { borderColor: c.border, color: c.text, backgroundColor: c.surfaceElevated }]}
            placeholder="Buscar usuário..."
            placeholderTextColor={c.textTertiary}
            value={search}
            onChangeText={setSearch}
          />

          {selectedIds.size > 0 && (
            <Text style={[styles.selectedCountText, { color: c.accent }]}>
              {selectedIds.size} selecionado(s)
            </Text>
          )}

          {isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={c.accent} />
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderUser}
              style={{ maxHeight: 300 }}
              ListEmptyComponent={
                <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                  <Text style={[styles.emptyText, { color: c.textTertiary }]}>
                    Nenhum usuário encontrado
                  </Text>
                </View>
              }
            />
          )}

          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.modalCancelBtn, { borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.modalBtnText, { color: c.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleSendInvites}
              disabled={isSending || selectedIds.size === 0}
              style={({ pressed }) => [
                styles.modalConfirmBtn,
                {
                  backgroundColor: selectedIds.size > 0 ? c.accent : c.surfaceElevated,
                  opacity: pressed || isSending ? 0.7 : 1,
                },
              ]}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={[styles.modalBtnText, { color: selectedIds.size > 0 ? '#000' : c.textTertiary }]}>
                  Enviar
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
