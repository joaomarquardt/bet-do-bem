import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Animated, Dimensions, TextInput, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { userService } from '@/lib/api/user.service';
import { User, UserResponse } from '@/lib/types';
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
  const [isAddingFriend, setIsAddingFriend] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<UserResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sentInvites, setSentInvites] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    const query = usernameToAdd.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await userService.searchUsers(query, { size: 5 });
        const filtered = resp.content.filter(u => u.id.toString() !== userId.toString());
        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [usernameToAdd, userId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setPage(0);
    try {
      const [response, sentInvitesResponse] = await Promise.all([
        userService.getUserFriends(userId, { page: 0, size: 10 }),
        friendInviteService.getMySentPendingInvites()
      ]);
      setFriends(response.content);
      setHasNext(response.hasNext);
      
      const sentIds = new Set(sentInvitesResponse.map(i => i.invitee.id));
      setSentInvites(sentIds);
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

  const handleSendInvite = async (username: string, targetUserId: number) => {
    setIsAddingFriend(targetUserId);
    try {
      await friendInviteService.createInvite(username);
      setSentInvites(prev => new Set(prev).add(targetUserId));
      Alert.alert('Sucesso', 'Convite de amizade enviado!');
    } catch (error: any) {
      if (error?.response?.status === 404) {
        Alert.alert('Erro', 'Usuário não foi encontrado.');
      } else if (error?.response?.status === 409 || error?.response?.status === 400) {
        Alert.alert('Erro', error.response.data?.message || 'Já há uma solicitação pendente ou vocês já são amigos.');
        setSentInvites(prev => new Set(prev).add(targetUserId));
      } else {
        Alert.alert('Erro', 'Não foi possível enviar o convite.');
      }
    } finally {
      setIsAddingFriend(null);
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
                placeholder="Buscar usuário para adicionar..."
                placeholderTextColor={c.textTertiary}
                value={usernameToAdd}
                onChangeText={setUsernameToAdd}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>

            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map(s => (
                  <View key={s.id} style={styles.suggestionItem}>
                    <Avatar name={s.fullName} imageUri={s.profilePictureUrl} size={30} color="#555" />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: 'bold' }}>{s.fullName}</Text>
                      <Text style={{ color: c.textSecondary, fontSize: 12 }}>@{s.username}</Text>
                    </View>
                    {sentInvites.has(s.id) ? (
                      <Ionicons name="time" size={20} color={c.textTertiary} />
                    ) : (
                      <TouchableOpacity 
                        style={styles.suggestionAddBtn}
                        onPress={() => handleSendInvite(s.username, s.id)}
                        disabled={isAddingFriend === s.id}
                      >
                        {isAddingFriend === s.id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Ionicons name="person-add" size={16} color="#fff" />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {isSearching && (
              <ActivityIndicator size="small" color={c.accent} style={{ marginTop: 10 }} />
            )}

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
  suggestionsContainer: {
    backgroundColor: c.surfaceElevated,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.border,
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.surface,
  },
  suggestionAddBtn: {
    width: 32,
    height: 32,
    backgroundColor: c.accent,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
