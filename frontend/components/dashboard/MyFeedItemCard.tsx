
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { FeedItemResponse, BetResponse, ActivityResponse, ChallengeResponse, Bet, Activity, Challenge, Proof, PaginatedResponse, CommentResponse} from '@/lib/types';
import { formatDeadline, formatDateTime } from '@/lib/utils/formatters';
import { CommentSection } from '@/components/feed/CommentSection';
import { BetCard } from '@/components/feed/BetCard';
import { ChallengeCard } from '@/components/feed/ChallengeCard';
import { ActivityCard } from '@/components/feed/ActivityCard';
import { styles } from './MyFeedItemCard.styles';
import { useAuth } from '@/lib/contexts/auth.context';

const c = Colors.dark;

interface MyFeedItemCardProps {
  item: FeedItemResponse | ((Bet | Activity | Challenge) & { feedItemType: 'BET' | 'ACTIVITY' | 'CHALLENGE', commentsData?: PaginatedResponse<CommentResponse> | null });
  index: number;
  onAccept?: () => void;
  onDecline?: () => void;
  onSendProof?: () => void;
}

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function proofAuthorId(p: Proof): number | undefined {
  return p.authorId ?? (p as any).author?.id;
}

function proofForParticipant(
  proofs: Proof[] | undefined,
  participantId: number | undefined,
  fallbackIndex: number,
): Proof | undefined {
  if (!proofs?.length || participantId == null) return undefined;
  const match = proofs.find((p) => proofAuthorId(p) === participantId);
  if (match) return match;
  const allMissingAuthor = proofs.every((p) => proofAuthorId(p) === undefined);
  if (allMissingAuthor && proofs[fallbackIndex]) return proofs[fallbackIndex];
  return undefined;
}

function getMediaInfo(p: any) {
  if (!p) return { uri: '', isVideo: false };
  const uri = p.imageUrl ?? p.image_url ?? '';
  const ct = String(p.contentType ?? p.content_type ?? '').toLowerCase();
  const isVideo =
    ct.startsWith('video') || /\.(mp4|mov|webm|mkv)$/i.test(uri);
  return { uri, isVideo };
}

function renderPendingMetadataRows({
  typeLabel,
  description,
  createdAt,
  expirationLabel,
}: {
  typeLabel: 'Aposta' | 'Desafio';
  description: string;
  createdAt: string;
  /** Omit or pass null to hide the expiration row (e.g. bet invite has no deadline yet). */
  expirationLabel?: string | null;
}) {
  return (
    <View style={styles.pendingMetadataList}>
      <View style={styles.pendingMetadataItem}>
        <Ionicons name="pricetag-outline" size={14} color={c.accent} />
        <Text style={[styles.pendingMetadataKey, { color: c.textTertiary }]}>Tipo:</Text>
        <Text style={[styles.pendingMetadataValue, { color: c.text }]}>{typeLabel}</Text>
      </View>
      <View style={styles.pendingMetadataItem}>
        <Ionicons name="calendar-outline" size={14} color={c.textSecondary} />
        <Text style={[styles.pendingMetadataKey, { color: c.textTertiary }]}>Criado:</Text>
        <Text style={[styles.pendingMetadataValue, { color: c.text }]}>
          {formatDateTime(createdAt)}
        </Text>
      </View>
      {expirationLabel != null && expirationLabel !== '' ? (
        <View style={styles.pendingMetadataItem}>
          <Ionicons name="time-outline" size={14} color={c.warning} />
          <Text style={[styles.pendingMetadataKey, { color: c.textTertiary }]}>Expira:</Text>
          <Text style={[styles.pendingMetadataValue, { color: c.text }]}>{expirationLabel}</Text>
        </View>
      ) : null}
      <View style={styles.pendingDescriptionRow}>
        <Ionicons name="document-text-outline" size={14} color={c.textSecondary} />
        <Text style={[styles.pendingMetadataKey, { color: c.textTertiary }]}>Descrição:</Text>
        <Text style={[styles.pendingDescriptionText, { color: c.textSecondary }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </View>
  );
}

function getStatusConfig(item: FeedItemResponse | (Bet | Activity | Challenge) & { feedItemType: 'BET' | 'ACTIVITY' | 'CHALLENGE' }, currentUserId: number | null): StatusConfig {
  const { feedItemType, content } = item as any;
  const data = content || item;

  switch (feedItemType) {
    case 'BET': {
      const bet = data as BetResponse;
      const isCreator = bet.creator?.id === currentUserId;

      switch (bet.status) {
        case 'INVITED':
          return { label: 'Convite Pendente', color: c.warning, bg: c.warningDim, icon: 'mail-outline' };
        case 'IN_PROGRESS': {
          const myProof = bet.proofs && bet.proofs.length > 0 && bet.proofs.some(p => p.authorId === currentUserId);
          if (myProof) return { label: 'Prova Enviada', color: c.accent, bg: c.accentDim, icon: 'checkmark-circle-outline' };
          return { label: 'Enviar Prova', color: c.warning, bg: c.warningDim, icon: 'camera-outline' };
        }
        case 'IN_JUDGMENT':
          return { label: 'Em Julgamento', color: '#AB47BC', bg: 'rgba(171,71,188,0.15)', icon: 'people-outline' };
        case 'FINISHED_WIN_CREATOR':
          return isCreator
            ? { label: 'Vitória', color: c.win, bg: c.winDim, icon: 'trophy-outline' }
            : { label: 'Derrota', color: c.loss, bg: c.lossDim, icon: 'close-circle-outline' };
        case 'FINISHED_WIN_OPPONENT':
          return !isCreator
            ? { label: 'Vitória', color: c.win, bg: c.winDim, icon: 'trophy-outline' }
            : { label: 'Derrota', color: c.loss, bg: c.lossDim, icon: 'close-circle-outline' };
        case 'FINISHED_DRAW':
          return { label: 'Empate', color: c.draw, bg: c.drawDim, icon: 'swap-horizontal-outline' };
        default:
          return { label: bet.status, color: c.textSecondary, bg: c.surfaceHighlight, icon: 'ellipse-outline' };
      }
    }

    case 'CHALLENGE': {
      const challenge = data as ChallengeResponse;
      const isChallenger = challenge.challenger?.id === currentUserId;

      switch (challenge.status) {
        case 'INVITED':
          return { label: 'Convite Pendente', color: c.warning, bg: c.warningDim, icon: 'mail-outline' };
        case 'IN_PROGRESS': {
          if (challenge.proof) return { label: 'Prova Enviada', color: c.accent, bg: c.accentDim, icon: 'checkmark-circle-outline' };
          return { label: 'Enviar Prova', color: c.warning, bg: c.warningDim, icon: 'camera-outline' };
        }
        case 'IN_JUDGMENT':
          return { label: 'Em Julgamento', color: '#AB47BC', bg: 'rgba(171,71,188,0.15)', icon: 'people-outline' };
        case 'SUCCESS':
          return { label: 'Vitória', color: c.win, bg: c.winDim, icon: 'trophy-outline' };
        case 'FAILED':
          return { label: 'Derrota', color: c.loss, bg: c.lossDim, icon: 'close-circle-outline' };
        case 'EXPIRED':
          return { label: 'Expirado', color: c.textSecondary, bg: c.surfaceHighlight, icon: 'time-outline' };
        default:
          return { label: challenge.status, color: c.textSecondary, bg: c.surfaceHighlight, icon: 'ellipse-outline' };
      }
    }

    case 'ACTIVITY': {
      const activity = data as ActivityResponse;

      switch (activity.status) {
        case 'IN_JUDGMENT':
          return { label: 'Em Julgamento', color: '#AB47BC', bg: 'rgba(171,71,188,0.15)', icon: 'people-outline' };
        case 'APPROVED':
          return { label: 'Aprovado', color: c.win, bg: c.winDim, icon: 'checkmark-circle-outline' };
        case 'REJECTED':
          return { label: 'Rejeitado', color: c.loss, bg: c.lossDim, icon: 'close-circle-outline' };
        case 'EXPIRED':
          return { label: 'Expirado', color: c.textSecondary, bg: c.surfaceHighlight, icon: 'time-outline' };
        default:
          return { label: activity.status, color: c.textSecondary, bg: c.surfaceHighlight, icon: 'ellipse-outline' };
      }
    }

    default:
      return { label: 'Desconhecido', color: c.textSecondary, bg: c.surfaceHighlight, icon: 'ellipse-outline' };
  }
}

export function MyFeedItemCard({ item, index, onAccept, onDecline, onSendProof }: MyFeedItemCardProps) {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const statusConfig = getStatusConfig(item, currentUserId);

  if (item.feedItemType === 'BET') {
    const bet = ((item as any).content || item) as BetResponse;
    const isCreator = bet.creator?.id === currentUserId;
    const otherPlayer = isCreator ? bet.opponent : bet.creator;
    const hasMyProof = bet.proofs && bet.proofs.length > 0 && bet.proofs.some(p => p.authorId === currentUserId);

    if (bet.status !== 'INVITED' && bet.status !== 'IN_PROGRESS') {
      return (
        <BetCard
          bet={bet as unknown as Bet}
          index={index}
          commentsData={(item as any).commentsData ?? null}
          hideVotingControls={true}
          statusBadge={statusConfig as any}
          initialVoteData={(item as any).votePercentage ?? null}
        />
      );
    }

    return (
      <Animated.View entering={FadeInRight.delay(index * 60).duration(300)} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={styles.topRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <View style={[styles.buyInBadge, { backgroundColor: c.warningDim }]}>
            <FontAwesome5 name="coins" size={12} color={c.warning} />
            <Text style={[styles.buyInText, { color: c.warning }]}>{bet.buyIn}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>{bet.title}</Text>

        {bet.status === 'INVITED' &&
          renderPendingMetadataRows({
            typeLabel: 'Aposta',
            description: bet.description,
            createdAt: bet.createdAt,
          })}

        <View style={styles.opponentRow}>
          <Text style={[styles.vsLabel, { color: c.textTertiary }]}>{isCreator ? 'vs' : 'de'}</Text>
          <Avatar name={otherPlayer?.fullName ?? '?'} color={"#CCCCCC"} size={24} />
          <Text style={[styles.opponentName, { color: c.textSecondary }]}>@{otherPlayer?.username ?? '...'}</Text>
          {bet.status !== 'INVITED' ? (
            <Text style={[styles.deadline, { color: c.textTertiary }]}>
              {formatDeadline(bet.expiresAt)}
            </Text>
          ) : null}
        </View>



        {bet.status === 'INVITED' && !isCreator && onAccept && onDecline && (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.declineBtn, { borderColor: c.danger, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDecline(); }}
            >
              <Ionicons name="close" size={18} color={c.danger} />
              <Text style={[styles.actionText, { color: c.danger }]}>Recusar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.acceptBtn, { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onAccept(); }}
            >
              <Ionicons name="checkmark" size={18} color="#000" />
              <Text style={[styles.actionText, { color: '#000' }]}>Aceitar</Text>
            </Pressable>
          </View>
        )}

        {bet.status === 'IN_PROGRESS' && !hasMyProof && (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.acceptBtn, { backgroundColor: c.warning, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (onSendProof) onSendProof();
                else console.warn('onSendProof not provided for MyBetCard', item.id);
              }}
            >
              <Ionicons name="camera-outline" size={18} color="#000" />
              <Text style={[styles.actionText, { color: '#000' }]}>Enviar Prova</Text>
            </Pressable>
          </View>
        )}


      </Animated.View>
    );
  }

  if (item.feedItemType === 'CHALLENGE') {
    const challenge = ((item as any).content || item) as ChallengeResponse;
    const isChallenger = challenge.challenger?.id === currentUserId;
    const otherPlayer = isChallenger ? challenge.challenged : challenge.challenger;
    const proofMedia = getMediaInfo(challenge.proof);

    if (challenge.status !== 'INVITED' && challenge.status !== 'IN_PROGRESS') {
      return (
        <ChallengeCard
          challenge={challenge as unknown as Challenge}
          index={index}
          commentsData={(item as any).commentsData ?? null}
          hideVotingControls={true}
          statusBadge={statusConfig as any}
          initialVoteData={(item as any).votePercentage ?? null}
        />
      );
    }

    return (
      <Animated.View entering={FadeInRight.delay(index * 60).duration(300)} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={styles.topRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <View style={[styles.buyInBadge, { backgroundColor: c.warningDim }]}>
            <FontAwesome5 name="coins" size={12} color={c.warning} />
            <Text style={[styles.buyInText, { color: c.warning }]}>{challenge.amount}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>{challenge.title}</Text>

        {challenge.status === 'INVITED' &&
          renderPendingMetadataRows({
            typeLabel: 'Desafio',
            description: challenge.description,
            createdAt: challenge.createdAt,
            expirationLabel: formatDateTime(challenge.deadline),
          })}

        <View style={styles.opponentRow}>
          <Text style={[styles.vsLabel, { color: c.textTertiary }]}>{isChallenger ? 'vs' : 'de'}</Text>
          <Avatar name={otherPlayer?.fullName ?? '?'} color={"#CCCCCC"} size={24} />
          <Text style={[styles.opponentName, { color: c.textSecondary }]}>@{otherPlayer?.username ?? '...'}</Text>
          <Text style={[styles.deadline, { color: c.textTertiary }]}>{formatDeadline(challenge.deadline)}</Text>
        </View>



        {challenge.status === 'INVITED' && !isChallenger && onAccept && onDecline && (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.declineBtn, { borderColor: c.danger, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDecline(); }}
            >
              <Ionicons name="close" size={18} color={c.danger} />
              <Text style={[styles.actionText, { color: c.danger }]}>Recusar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.acceptBtn, { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onAccept(); }}
            >
              <Ionicons name="checkmark" size={18} color="#000" />
              <Text style={[styles.actionText, { color: '#000' }]}>Aceitar</Text>
            </Pressable>
          </View>
        )}

        {challenge.status === 'IN_PROGRESS' && !challenge.proof && (
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.acceptBtn, { backgroundColor: c.warning, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (onSendProof) onSendProof();
                else console.warn('onSendProof not provided for MyChallengeCard', item.id);
              }}
            >
              <Ionicons name="camera-outline" size={18} color="#000" />
              <Text style={[styles.actionText, { color: '#000' }]}>Enviar Prova</Text>
            </Pressable>
          </View>
        )}


      </Animated.View>
    );
  }

  if (item.feedItemType === 'ACTIVITY') {
    const activity = ((item as any).content || item) as ActivityResponse;
    const media = getMediaInfo(activity.proof);

    return (
      <ActivityCard
        activity={activity as unknown as Activity}
        index={index}
        commentsData={(item as any).commentsData ?? null}
        hideVotingControls={true}
        statusBadge={statusConfig as any}
        initialVoteData={(item as any).votePercentage ?? null}
      />
    );
  }
  return null;
}
