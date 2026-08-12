import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Animated, Dimensions, TextInput, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { userService } from '@/lib/api/user.service';
import { User } from '@/lib/types';
import { friendInviteService } from '@/lib/api/friend-invite.service';
import { Avatar } from './Avatar';

interface FriendsSidebarProps {
  visible: boolean;
  onClose: () => void;
  userId: string | number;
}

const c = Colors.dark;

export function FriendsSidebar({ visible, onClose, userId }: FriendsSidebarProps) {
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      loadInitialData();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
        setFriends([]);
        setPage(0);
      });
    }
  }, [visible, userId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setPage(0);
    try {
      const response = await userService.getUserFriends(userId, { page: 0, size: 10 });
      setFriends(response.content);
      setHasNext(response.hasNext);
    } catch (error) {
      console.error('Failed to load friends', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreData = async () => {
    if (!hasNext || isFetchingMore || isLoading) return;
    
    setIsFetchingMore(true);
    const nextPage = page + 1;
    try {
      const response = await userService.getUserFriends(userId, { page: nextPage, size: 10 });
      setFriends(prev => [...prev, ...response.content]);
      setHasNext(response.hasNext);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more friends', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const renderFriend = ({ item }: { item: User }) => {
    const rawFullName = item.fullName ?? item.email ?? 'Usuário';
    const nameParts = rawFullName.trim().split(' ');
    const displayName = nameParts.length > 1 
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
      : nameParts[0];

    return (
      <View style={styles.friendCard}>
        <Avatar name={displayName} color="#CCCCCC" imageUri={item.profilePictureUrl} size={48} />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.fullName}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
      </View>
    );
  };

  const handleAddFriend = async () => {
    const trimmed = usernameToAdd.trim();
    if (!trimmed) return;
    setIsAddingFriend(true);
    try {
      await friendInviteService.createInvite(trimmed);
      Alert.alert('Sucesso', 'Convite de amizade enviado!');
      setUsernameToAdd('');
    } catch (error: any) {
      if (error?.response?.status === 404) {
        Alert.alert('Erro', 'Usuário não foi encontrado.');
      } else if (error?.response?.status === 409 || error?.response?.status === 400) {
        Alert.alert('Erro', error.response.data?.message || 'Já há uma solicitação pendente ou vocês já são amigos.');
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o convite.');
      }
    } finally {
      setIsAddingFriend(false);
    }
  };

  return (
    <Modal visible={showModal} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Amigos</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.addFriendContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Adicionar por username..."
                placeholderTextColor={c.textTertiary}
                value={usernameToAdd}
                onChangeText={setUsernameToAdd}
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={handleAddFriend}
              />
              <TouchableOpacity
                style={[styles.addBtn, !usernameToAdd.trim() && { opacity: 0.5 }]}
                onPress={handleAddFriend}
                disabled={!usernameToAdd.trim() || isAddingFriend}
              >
                {isAddingFriend ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="person-add" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={c.accent} style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.content}>
                <FlatList
                  data={friends}
                  renderItem={renderFriend}
                  keyExtractor={item => item.id.toString()}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={<Text style={styles.emptyText}>Nenhum amigo encontrado.</Text>}
                  onEndReached={loadMoreData}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    isFetchingMore ? <ActivityIndicator size="small" color={c.accent} style={{ margin: 10 }} /> : null
                  }
                />
              </View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  sidebar: {
    width: '85%',
    height: '100%',
    backgroundColor: c.background,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: c.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: c.text,
  },
  closeBtn: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  list: {
    flex: 1,
    backgroundColor: c.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    color: c.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.surface,
  },
  friendInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: c.text,
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: c.textSecondary,
  },
  addFriendContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.surface,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: c.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: c.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: c.accent,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
