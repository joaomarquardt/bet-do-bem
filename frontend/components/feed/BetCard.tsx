
import { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Image } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { proofService } from '@/lib/api/proof.service';
import { CommentSection } from '@/components/feed/CommentSection';
import { Bet, Proof, PaginatedResponse, CommentResponse } from '@/lib/types';
import { formatTimeAgo, formatDeadline } from '@/lib/utils/formatters';
import { useBets } from '@/lib/contexts';
import { styles } from './BetCard.styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function proofAuthorId(p: Proof): number | undefined {
  return p.authorId ?? p.author?.id;
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

interface BetCardProps {
  bet: Bet;
  index: number;
  commentsData: PaginatedResponse<CommentResponse> | null;
}

export function BetCard({ bet, index, commentsData }: BetCardProps) {
  const { voteBet } = useBets();
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const c = Colors.dark;
  const creatorName = bet.creator?.name ?? (bet.creator as any)?.displayName ?? (bet.creator as any)?.username ?? '...';
  const opponentName = bet.opponent?.name ?? (bet.opponent as any)?.displayName ?? (bet.opponent as any)?.username ?? '...';

  const handleVote = useCallback(
    async (proofId: any, userId: string) => {
      if (hasVoted) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        await proofService.voteInProof(String(proofId), { approved: true } as any);
      } catch (e) {
        return;
      }
      setHasVoted(true);
      setVotedFor(userId);
      voteBet(bet.id.toString(), userId);
    },
    [hasVoted, bet.id, voteBet],
  );

  const creatorProof = proofForParticipant(bet.proofs, bet.creator?.id, 0);
  const opponentProof = proofForParticipant(bet.proofs, bet.opponent?.id, 1);

  const getMediaInfo = (p: any) => {
    if (!p) return { uri: '', isVideo: false, label: '' };
    const uri = p.imageUrl ?? p.image_url ?? '';
    const ct = String(p.contentType ?? p.content_type ?? '').toLowerCase();
    const isVideo = ct.startsWith('video') || /\.(mp4|mov|webm|mkv)$/i.test(uri);
    const label = p.fileName ?? p.file_name ?? uri.split('/').pop() ?? p.postedAt ?? '';
    return { uri, isVideo, label };
  };

  const creatorMedia = getMediaInfo(creatorProof);
  const opponentMedia = getMediaInfo(opponentProof);

  useEffect(() => {
    if (creatorMedia.uri) {
      Image.prefetch(creatorMedia.uri).catch(() => {});
    }
    if (opponentMedia.uri) {
      Image.prefetch(opponentMedia.uri).catch(() => {});
    }
  }, [creatorMedia.uri, opponentMedia.uri]);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.betMeta}>
          <View style={[styles.statusBadge, { backgroundColor: c.accentDim }]}>
            <MaterialCommunityIcons name="gavel" size={12} color={c.accent} />
            <Text style={[styles.statusText, { color: c.accent }]}>Em Julgamento</Text>
          </View>
          <Text style={[styles.timeAgo, { color: c.textTertiary }]}>{formatTimeAgo(bet.createdAt)}</Text>
        </View>
        <View style={[styles.buyInBadge, { backgroundColor: c.warningDim }]}>
          <MaterialCommunityIcons name="currency-usd" size={14} color={c.warning} />
          <Text style={[styles.buyInText, { color: c.warning }]}>{bet.buyIn}</Text>
        </View>
      </View>

      <Text style={[styles.betTitle, { color: c.text }]}>{bet.title}</Text>
      <Text style={[styles.betDescription, { color: c.textSecondary }]}>{bet.description}</Text>

      <View style={[styles.vsContainer, { borderColor: c.border }]}>
        <View style={styles.playerSide}>
          <Avatar name={creatorName} color={"#CCCCCC"} size={36} />
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: c.text }]}>{creatorName}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{creatorName}</Text>
          </View>
        </View>
        <View style={[styles.vsBadge, { backgroundColor: c.surfaceHighlight }]}>
          <Text style={[styles.vsText, { color: c.accent }]}>VS</Text>
        </View>
        <View style={[styles.playerSide, { alignItems: 'flex-end' }]}>
          <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
            <Text style={[styles.playerName, { color: c.text }]}>{opponentName}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{opponentName}</Text>
          </View>
          <Avatar name={opponentName} color={"#CCCCCC"} size={36} />
        </View>
      </View>
      {(creatorMedia.uri || opponentMedia.uri) && (
        <View style={styles.mediaRow}>
          {creatorMedia.uri && opponentMedia.uri ? (
            <>
              <View style={styles.mediaWrapper}>
                <Image source={{ uri: creatorMedia.uri }} style={styles.mediaImageHalf} />
                {creatorMedia.isVideo && (
                  <View style={styles.proofMediaOverlay}>
                    <Ionicons name="play" size={20} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.mediaWrapper}>
                <Image source={{ uri: opponentMedia.uri }} style={styles.mediaImageHalf} />
                {opponentMedia.isVideo && (
                  <View style={styles.proofMediaOverlay}>
                    <Ionicons name="play" size={20} color="#fff" />
                  </View>
                )}
              </View>
            </>
          ) : creatorMedia.uri ? (
            <View style={styles.mediaWrapper}>
              <Image source={{ uri: creatorMedia.uri }} style={styles.mediaImageLarge} />
              {creatorMedia.isVideo && (
                <View style={styles.proofMediaOverlay}>
                  <Ionicons name="play" size={20} color="#fff" />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.mediaWrapper}>
              <Image source={{ uri: opponentMedia.uri }} style={styles.mediaImageLarge} />
              {opponentMedia.isVideo && (
                <View style={styles.proofMediaOverlay}>
                  <Ionicons name="play" size={20} color="#fff" />
                </View>
              )}
            </View>
          )}
        </View>
      )}



      {hasVoted && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.voteResults}>
          <Text style={[styles.totalVotes, { color: c.textTertiary }]}>Voto computado!</Text>
        </Animated.View>
      )}

      {!hasVoted && bet.creator && bet.opponent && (
        <View style={styles.voteButtons}>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => {
              if (creatorProof?.id == null) return;
              handleVote(creatorProof.id, String(bet.creator.id));
            }}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{creatorName}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => {
              if (opponentProof?.id == null) return;
              handleVote(opponentProof.id, String(bet.opponent.id));
            }}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{opponentName}</Text>
          </Pressable>
        </View>
      )}

      <CommentSection
        entityType="BET"
        entityId={bet.id}
        commentsData={commentsData}
      />
    </Animated.View>
  );
}
