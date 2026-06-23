import { View, Text, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { Bet, Challenge, User } from '@/lib/types';
import type { BetsTabItem } from '@/lib/utils/feedItemMappers';
import { styles } from './PendingInviteCard.styles';

const c = Colors.dark;

type ParticipantUser = User & {
  displayName?: string;
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

function getDisplayName(user: ParticipantUser | undefined): string {
  if (!user) return 'Usuário';
  return user.displayName ?? user.name ?? 'Usuário';
}

function getHandle(user: ParticipantUser | undefined): string {
  if (!user) return '@...';
  if (user.username) return `@${user.username}`;
  return `#${user.id ?? '?'}`;
}

function ParticipantColumn({
  roleLabel,
  user,
  isCurrentUser,
}: {
  roleLabel: string;
  user: ParticipantUser | undefined;
  isCurrentUser: boolean;
}) {
  const name = getDisplayName(user);
  const handle = getHandle(user);
  const avatarColor = user?.avatarColor ?? '#CCCCCC';

  return (
    <View style={styles.participant}>
      <View
        style={[
          styles.participantHighlight,
          isCurrentUser && {
            borderWidth: 2,
            borderColor: c.accent,
            backgroundColor: c.accentDim,
          },
        ]}
      >
        <Avatar
          name={name}
          color={avatarColor}
          size={52}
          imageUri={user?.profilePictureUrl}
        />
      </View>
      <Text style={[styles.roleLabel, { color: c.textTertiary }]}>{roleLabel}</Text>
      <Text
        style={[styles.participantName, { color: c.text }]}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text
        style={[styles.participantHandle, { color: c.textSecondary }]}
        numberOfLines={1}
      >
        {handle}
      </Text>
      {isCurrentUser ? (
        <View style={[styles.youBadge, { backgroundColor: c.accentDim }]}>
          <Text style={[styles.youBadgeText, { color: c.accent }]}>Você</Text>
        </View>
      ) : null}
    </View>
  );
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

  const challengerSide: ParticipantUser | undefined = isBet
    ? (bet!.creator as ParticipantUser)
    : (challenge!.challenger as ParticipantUser);
  const challengedSide: ParticipantUser | undefined = isBet
    ? (bet!.opponent as ParticipantUser)
    : (challenge!.challenged as ParticipantUser);

  const challengerIsYou = Number(challengerSide?.id) === currentUserId;
  const challengedIsYou = Number(challengedSide?.id) === currentUserId;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 60).duration(300)}
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
    >
      <View style={[styles.statusBanner, { backgroundColor: c.warningDim }]}>
        <Ionicons name="mail-unread-outline" size={18} color={c.warning} />
        <Text style={[styles.statusBannerText, { color: c.warning }]}>
          Aguardando sua resposta — aceite ou recuse este convite
        </Text>
      </View>

      <View style={styles.mainContent}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text
            style={[styles.description, { color: c.textSecondary }]}
            numberOfLines={3}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <View style={[styles.stakeRow, { backgroundColor: c.surfaceHighlight }]}>
        <MaterialCommunityIcons name="currency-usd" size={20} color={c.warning} />
        <View>
          <Text style={[styles.stakeLabel, { color: c.textTertiary }]}>
            Valor da aposta
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={[styles.stakeValue, { color: c.warning }]}>{stake}</Text>
            <Text style={[styles.stakeUnit, { color: c.textSecondary }]}>
              moedas
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.duelSection,
          { backgroundColor: c.surfaceElevated, borderColor: c.border },
        ]}
      >
        <View style={styles.duelRow}>
          <ParticipantColumn
            roleLabel="Desafiante"
            user={challengerSide}
            isCurrentUser={challengerIsYou}
          />

          <View style={styles.vsContainer}>
            <View
              style={[
                styles.vsBadge,
                {
                  backgroundColor: c.accentDim,
                  borderColor: c.accent,
                },
              ]}
            >
              <Text style={[styles.vsText, { color: c.accent }]}>VS</Text>
            </View>
          </View>

          <ParticipantColumn
            roleLabel="Desafiado"
            user={challengedSide}
            isCurrentUser={challengedIsYou}
          />
        </View>
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
          <Ionicons name="close" size={20} color={c.danger} />
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
          <Ionicons name="checkmark" size={20} color="#000" />
          <Text style={[styles.actionText, { color: '#000' }]}>Aceitar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
