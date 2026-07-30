import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { groupInviteService } from '@/lib/api';
import { friendInviteService } from '@/lib/api';
import { GroupInvite, FriendInvite } from '@/lib/types';
import { Avatar } from './Avatar';

interface NotificationsSidebarProps {
  visible: boolean;
  onClose: () => void;
}

const c = Colors.dark;

export function NotificationsSidebar({ visible, onClose }: NotificationsSidebarProps) {
  const [friendInvites, setFriendInvites] = useState<FriendInvite[]>([]);
  const [groupInvites, setGroupInvites] = useState<GroupInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [expandedSection, setExpandedSection] = useState<'friend' | 'group' | null>(null);

  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      loadData();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setExpandedSection(null);
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [friends, groups] = await Promise.all([
        friendInviteService.getMyPendingInvites(),
        groupInviteService.getMyPendingInvites()
      ]);
      setFriendInvites(friends);
      setGroupInvites(groups);
    } catch (error) {
      console.error('Failed to load invites', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptFriend = async (id: number) => {
    try {
      await friendInviteService.acceptInvite(id);
      setFriendInvites((prev) => prev.filter((inv) => inv.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineFriend = async (id: number) => {
    try {
      await friendInviteService.declineInvite(id);
      setFriendInvites((prev) => prev.filter((inv) => inv.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptGroup = async (id: number) => {
    try {
      await groupInviteService.acceptInvite(id);
      setGroupInvites((prev) => prev.filter((inv) => inv.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineGroup = async (id: number) => {
    try {
      await groupInviteService.declineInvite(id);
      setGroupInvites((prev) => prev.filter((inv) => inv.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const renderFriendInvite = ({ item }: { item: FriendInvite }) => (
    <View style={styles.inviteCard}>
      <View style={styles.inviteHeader}>
        <Avatar name={item.inviter.fullName} color="#CCCCCC" imageUri={item.inviter.profilePictureUrl} size={40} />
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteName}>{item.inviter.fullName}</Text>
          <Text style={styles.inviteSubtitle}>Quer ser seu amigo</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAcceptFriend(item.id)}>
          <Text style={styles.acceptBtnText}>Aceitar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={() => handleDeclineFriend(item.id)}>
          <Text style={styles.declineBtnText}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGroupInvite = ({ item }: { item: GroupInvite }) => (
    <View style={styles.inviteCard}>
      <View style={styles.inviteHeader}>
        <Avatar name={item.inviter.fullName} color="#CCCCCC" imageUri={item.inviter.profilePictureUrl} size={40} />
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteName}>{item.inviter.fullName}</Text>
          <Text style={styles.inviteSubtitle}>Convidou para um grupo</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAcceptGroup(item.id)}>
          <Text style={styles.acceptBtnText}>Aceitar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]} onPress={() => handleDeclineGroup(item.id)}>
          <Text style={styles.declineBtnText}>Recusar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={showModal} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notificações</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={c.accent} style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.content}>
                <TouchableOpacity 
                  style={styles.summaryItem}
                  onPress={() => setExpandedSection(expandedSection === 'friend' ? null : 'friend')}
                >
                  <View style={styles.summaryLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="person-add" size={20} color={c.text} />
                    </View>
                    <Text style={styles.summaryText}>Convites de Amizade</Text>
                  </View>
                  <View style={styles.summaryRight}>
                    {friendInvites.length > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{friendInvites.length}</Text>
                      </View>
                    )}
                    <Ionicons 
                      name={expandedSection === 'friend' ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={c.textSecondary} 
                    />
                  </View>
                </TouchableOpacity>

                {expandedSection === 'friend' && (
                  <FlatList
                    data={friendInvites}
                    renderItem={renderFriendInvite}
                    keyExtractor={item => item.id.toString()}
                    style={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>Sem convites pendentes.</Text>}
                  />
                )}

                <TouchableOpacity 
                  style={styles.summaryItem}
                  onPress={() => setExpandedSection(expandedSection === 'group' ? null : 'group')}
                >
                  <View style={styles.summaryLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="people" size={20} color={c.text} />
                    </View>
                    <Text style={styles.summaryText}>Convites de Grupo</Text>
                  </View>
                  <View style={styles.summaryRight}>
                    {groupInvites.length > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{groupInvites.length}</Text>
                      </View>
                    )}
                    <Ionicons 
                      name={expandedSection === 'group' ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={c.textSecondary} 
                    />
                  </View>
                </TouchableOpacity>

                {expandedSection === 'group' && (
                  <FlatList
                    data={groupInvites}
                    renderItem={renderGroupInvite}
                    keyExtractor={item => item.id.toString()}
                    style={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>Sem convites pendentes.</Text>}
                  />
                )}
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
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: c.surface,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: c.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: c.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    maxHeight: 300,
    backgroundColor: c.background,
  },
  emptyText: {
    color: c.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  inviteCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.surface,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inviteInfo: {
    marginLeft: 12,
    flex: 1,
  },
  inviteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: c.text,
  },
  inviteSubtitle: {
    fontSize: 14,
    color: c.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: c.accent,
  },
  declineBtn: {
    backgroundColor: c.surface,
  },
  acceptBtnText: {
    color: c.background,
    fontWeight: 'bold',
  },
  declineBtnText: {
    color: c.text,
    fontWeight: 'bold',
  },
});
