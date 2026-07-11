import { View, Text, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { Bet, Challenge, User } from '@/lib/types';
import type { BetsTabItem } from '@/lib/utils/feedItemMappers';
import { styles } from './PendingInviteCard.styles';
import { formatDateTime } from '@/lib/utils/formatters';

const c = Colors.dark;

type ParticipantUser = User & {
  username?: string;
  avatarColor?: string;
};

interface PendingInviteCardProps {
  item: BetsTabItem;
  index: number;
  currentUserId: number;
  onAccept: () => void;
  onDecline: () => void;
}

function getExpirationText(expirationDateStr?: string) {
  if (!expirationDateStr) return '';
  const exp = new Date(expirationDateStr);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  if (diffMs <= 0) return 'O convite expirou';
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `Convite expira em ${hours}h e ${minutes}m`;
}

export function PendingInviteCard({
  item,
  index,
  currentUserId,
  onAccept,
  onDecline,
}: PendingInviteCardProps) {
  const isBet = item.feedItemType === 'BET';
  const bet = isBet ? (item as Bet) : null;
  const challenge = !isBet ? (item as Challenge) : null;

  const title = isBet ? bet!.title : challenge!.title;
  const description = isBet ? bet!.description : challenge!.description;
  const stake = isBet ? bet!.buyIn : challenge!.amount;

  const rawItem = item as any;
  const inviteExpiresAt = rawItem.inviteExpiresAt || rawItem.expiresAt;
  const deadline = rawItem.deadline;

  const challengerSide = isBet ? (bet!.creator as ParticipantUser) : (challenge!.challenger as ParticipantUser);
  
  const challengerName = challengerSide?.fullName || challengerSide?.username || 'Usuário';
  const challengerHandle = challengerSide?.username ? `@${challengerSide.username}` : `#${challengerSide?.id || '?'}`;

  const expirationText = getExpirationText(inviteExpiresAt);

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 60).duration(300)}
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
    >
      <View style={styles.header}>
        <View style={styles.participantRow}>
          <Avatar
            name={challengerName}
            color={challengerSide?.avatarColor ?? '#CCCCCC'}
            size={40}
            imageUri={challengerSide?.profilePictureUrl}
          />
          <View style={styles.participantInfo}>
            <Text style={[styles.participantName, { color: c.text }]} numberOfLines={1}>
              {challengerName}
            </Text>
            <Text style={[styles.participantHandle, { color: c.textSecondary }]} numberOfLines={1}>
              {challengerHandle}
            </Text>
          </View>
        </View>

        <MaterialCommunityIcons 
          name={isBet ? "handshake" : "bullseye-arrow"} 
          size={24} 
          color={c.accent} 
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text style={[styles.description, { color: c.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>

      <View style={[styles.detailsContainer, { backgroundColor: c.surfaceElevated }]}>
        <View style={styles.detailItem}>
          <FontAwesome5 name="coins" size={14} color={c.warning} />
          <Text style={[styles.detailText, { color: c.warning, fontWeight: 'bold' }]}>
            {stake} moedas
          </Text>
        </View>

        {deadline && (
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={c.textTertiary} />
            <Text style={[styles.detailText, { color: c.textTertiary }]}>
              Prazo para conclusão: {formatDateTime(deadline)}
            </Text>
          </View>
        )}

        {expirationText ? (
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={c.textTertiary} />
            <Text style={[styles.detailText, { color: c.textTertiary }]}>
              {expirationText}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [
            styles.declineBtn,
            { borderColor: c.danger, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDecline();
          }}
        >
          <Text style={[styles.actionText, { color: c.danger }]}>Recusar</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.acceptBtn,
            { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAccept();
          }}
        >
          <Text style={[styles.actionText, { color: '#000' }]}>Aceitar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
