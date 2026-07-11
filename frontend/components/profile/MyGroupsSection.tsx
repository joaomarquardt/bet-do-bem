import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { groupService } from '@/lib/api/group.service';
import { useAuth } from '@/lib/contexts';
import { CreateGroupModal } from './CreateGroupModal';
import { InviteMembersModal } from './InviteMembersModal';
import { groupStyles as styles } from './MyGroupsSection.styles';
import type { GroupResponse, UserResponse } from '@/lib/types';

const c = Colors.dark;

function stringToColor(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h},60%,50%)`;
}

interface MyGroupsSectionProps {
  refreshTrigger?: number;
}

export function MyGroupsSection({ refreshTrigger }: MyGroupsSectionProps) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteModalGroupId, setInviteModalGroupId] = useState<number | null>(null);
  const [leavingGroupId, setLeavingGroupId] = useState<number | null>(null);

  const loadGroups = useCallback(async () => {
    try {
      const data = await groupService.getMyGroups();
      setGroups(data);
    } catch (e) {
      console.error('Error loading groups', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups, refreshTrigger]);

  const toggleExpand = (groupId: number) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  };

  const handleLeaveGroup = (groupId: number, groupName: string) => {
    Alert.alert(
      'Sair do Grupo',
      `Tem certeza que deseja sair do grupo "${groupName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setLeavingGroupId(groupId);
            try {
              await groupService.leaveGroup(groupId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setGroups((prev) => prev.filter((g) => g.id !== groupId));
            } catch (e: any) {
              Alert.alert('Erro', e?.message || 'Não foi possível sair do grupo.');
            } finally {
              setLeavingGroupId(null);
            }
          },
        },
      ],
    );
  };

  const inviteModalGroup = groups.find((g) => g.id === inviteModalGroupId);

  return (
    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Meus Grupos</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCreateModal(true);
          }}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: c.accentDim, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="add" size={20} color={c.accent} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={c.accent} />
        </View>
      ) : groups.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ionicons name="people-outline" size={32} color={c.textTertiary} />
          <Text style={[styles.emptyText, { color: c.textTertiary }]}>Você ainda não faz parte de nenhum grupo</Text>
          <Pressable onPress={() => setShowCreateModal(true)}>
            <Text style={[styles.emptyText, { color: c.accent, marginTop: 4 }]}>Criar primeiro grupo</Text>
          </Pressable>
        </View>
      ) : (
        groups.map((group) => {
          const isExpanded = expandedGroupId === group.id;
          const isCreator = user?.id === group.creator?.id;
          const membersList: UserResponse[] = (group.members as UserResponse[]) || [];
          const isLeaving = leavingGroupId === group.id;

          return (
            <View key={group.id} style={[styles.groupCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Pressable onPress={() => toggleExpand(group.id)} style={styles.groupCardHeader}>
                <View style={styles.groupInfo}>
                  <Text style={[styles.groupName, { color: c.text }]} numberOfLines={1}>
                    {group.name}
                  </Text>
                  {group.description ? (
                    <Text style={[styles.groupDescription, { color: c.textSecondary }]} numberOfLines={1}>
                      {group.description}
                    </Text>
                  ) : null}
                  <Text style={[styles.groupMeta, { color: c.textTertiary }]}>
                    {membersList.length} membro{membersList.length !== 1 ? 's' : ''}
                    {isCreator ? ' · Criador' : ''}
                  </Text>
                </View>
                <View style={styles.expandButton}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={c.textTertiary}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={[styles.membersContainer, { borderTopColor: c.border }]}>
                  <Text style={[styles.membersTitle, { color: c.textSecondary }]}>Participantes</Text>
                  {membersList.map((member) => {
                    const isMemberCreator = member.id === group.creator?.id;
                    return (
                      <View key={member.id} style={styles.memberRow}>
                        <View style={styles.memberInfo}>
                          <Avatar
                            name={member.fullName}
                            color={stringToColor(member.fullName)}
                            size={32}
                            imageUri={member.profilePictureUrl}
                          />
                          <Text style={[styles.memberName, { color: c.text }]} numberOfLines={1}>
                            {member.fullName}
                          </Text>
                          {isMemberCreator && (
                            <Text style={[styles.memberCreatorBadge, { backgroundColor: c.accentDim, color: c.accent }]}>
                              Criador
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}

                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setInviteModalGroupId(group.id);
                    }}
                    style={({ pressed }) => [
                      styles.inviteButton,
                      { backgroundColor: c.accentDim, opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Ionicons name="person-add-outline" size={16} color={c.accent} />
                    <Text style={[styles.inviteButtonText, { color: c.accent }]}>Convidar Membros</Text>
                  </Pressable>

                  {!isCreator && (
                    <Pressable
                      onPress={() => handleLeaveGroup(group.id, group.name)}
                      disabled={isLeaving}
                      style={({ pressed }) => [
                        styles.leaveButton,
                        { borderColor: c.danger, opacity: pressed || isLeaving ? 0.6 : 1, marginTop: 8 },
                      ]}
                    >
                      {isLeaving ? (
                        <ActivityIndicator size="small" color={c.danger} />
                      ) : (
                        <>
                          <Ionicons name="exit-outline" size={14} color={c.danger} />
                          <Text style={[styles.leaveButtonText, { color: c.danger }]}>Sair do Grupo</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}

      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={loadGroups}
      />

      {inviteModalGroup && (
        <InviteMembersModal
          visible={inviteModalGroupId !== null}
          onClose={() => setInviteModalGroupId(null)}
          onInvitesSent={loadGroups}
          groupId={inviteModalGroup.id}
          existingMemberIds={((inviteModalGroup.members as UserResponse[]) || []).map((m) => m.id)}
        />
      )}
    </Animated.View>
  );
}
