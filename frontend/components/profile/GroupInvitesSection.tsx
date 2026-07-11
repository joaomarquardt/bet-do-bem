import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { groupInviteService } from '@/lib/api/group-invite.service';
import { groupStyles as styles } from './MyGroupsSection.styles';
import type { GroupInvite } from '@/lib/types';

const c = Colors.dark;

function getExpirationText(expirationDateStr?: string) {
  if (!expirationDateStr) return '';
  const exp = new Date(expirationDateStr);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return 'Convite expirado';
  const totalHours = Math.floor(diffMs / 3600000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `Convite expira em ${days}d e ${hours}h`;
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `Convite expira em ${hours}h e ${minutes}m`;
}

interface GroupInvitesSectionProps {
  onInviteResponded?: () => void;
}

export function GroupInvitesSection({ onInviteResponded }: GroupInvitesSectionProps) {
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<number | null>(null);

  const loadInvites = useCallback(async () => {
    try {
      const data = await groupInviteService.getMyPendingInvites();
      setInvites(data);
    } catch (e) {
      console.error('Error loading group invites', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleAccept = async (inviteId: number) => {
    setRespondingId(inviteId);
    try {
      await groupInviteService.acceptInvite(inviteId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      onInviteResponded?.();
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Não foi possível aceitar o convite.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleDecline = async (inviteId: number) => {
    setRespondingId(inviteId);
    try {
      await groupInviteService.declineInvite(inviteId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      onInviteResponded?.();
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Não foi possível recusar o convite.');
    } finally {
      setRespondingId(null);
    }
  };

  if (isLoading) return null;
  if (invites.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Convites de Grupo</Text>
        <Text style={[styles.sectionCount, { color: c.textTertiary }]}>{invites.length} pendente(s)</Text>
      </View>

      {invites.map((invite) => {
        const isResponding = respondingId === invite.id;
        return (
          <View
            key={invite.id}
            style={[styles.inviteCard, { backgroundColor: c.surface, borderColor: c.border }]}
          >
            <View style={styles.inviteCardHeader}>
              <View style={[styles.inviteGroupIcon, { backgroundColor: c.accentDim }]}>
                <Ionicons name="people" size={20} color={c.accent} />
              </View>
              <View style={styles.inviteInfo}>
                <Text style={[styles.inviteGroupName, { color: c.text }]}>{invite.groupName}</Text>
                <Text style={[styles.inviteFromText, { color: c.textSecondary }]}>
                  Convidado por {invite.inviter.fullName}
                </Text>
              </View>
            </View>

            <Text style={[styles.inviteExpiry, { color: c.textTertiary }]}>
              {getExpirationText(invite.expiresAt)}
            </Text>

            <View style={styles.inviteActions}>
              <Pressable
                onPress={() => handleDecline(invite.id)}
                disabled={isResponding}
                style={({ pressed }) => [
                  styles.declineBtn,
                  { borderColor: c.danger, opacity: pressed || isResponding ? 0.6 : 1 },
                ]}
              >
                {isResponding && respondingId === invite.id ? (
                  <ActivityIndicator size="small" color={c.danger} />
                ) : (
                  <Text style={[styles.actionText, { color: c.danger }]}>Recusar</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => handleAccept(invite.id)}
                disabled={isResponding}
                style={({ pressed }) => [
                  styles.acceptBtn,
                  { backgroundColor: c.accent, opacity: pressed || isResponding ? 0.7 : 1 },
                ]}
              >
                {isResponding && respondingId === invite.id ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={[styles.actionText, { color: '#000' }]}>Aceitar</Text>
                )}
              </Pressable>
            </View>
          </View>
        );
      })}
    </Animated.View>
  );
}
