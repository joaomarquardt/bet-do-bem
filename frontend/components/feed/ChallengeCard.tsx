
import { useState, useCallback } from 'react';
import { View, Text, Pressable, Platform, UIManager } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { ProofMediaFrame } from '@/components/feed/ProofMediaFrame';
import { CommentSection } from '@/components/feed/CommentSection';
import { Challenge, PaginatedResponse, CommentResponse, VotePercentageResponse } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils/formatters';
import { useChallenge } from '@/lib/contexts';
import { styles } from './BetCard.styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
  commentsData: PaginatedResponse<CommentResponse> | null;
  hideVotingControls?: boolean;
  statusBadge?: { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap | keyof typeof Ionicons.glyphMap; color: string; bg: string };
  initialVoteData?: VotePercentageResponse | null;
}

export function ChallengeCard({ challenge, index, commentsData, hideVotingControls, statusBadge, initialVoteData }: ChallengeCardProps) {
  const { voteChallenge } = useChallenge();
  const [hasVoted, setHasVoted] = useState(!!initialVoteData);
  const [votedFor, setVotedFor] = useState<boolean | null>(null);
  const [voteData, setVoteData] = useState<VotePercentageResponse | null>(initialVoteData || null);
  const [isVoting, setIsVoting] = useState(false);
  const c = Colors.dark;
  const challengerName =
    challenge.challenger?.fullName ??
    (challenge.challenger as any)?.username ??
    '...';
  const challengedName =
    challenge.challenged?.fullName ??
    (challenge.challenged as any)?.username ??
    '...';
  const proofUri = challenge.proof?.imageUrl ?? (challenge.proof as any)?.mediaUri ?? '';
  const isVideo =
    String(challenge.proof?.contentType ?? '').toLowerCase().startsWith('video') ||
    /\.(mp4|mov|webm|mkv)$/i.test(proofUri);

  const handleVote = useCallback(async (approved: boolean) => {
    if (hasVoted || isVoting) return;
    const proofId = challenge.proof?.id;
    if (proofId == null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVoting(true);
    try {
      const response = await voteChallenge(String(proofId), approved);
      setHasVoted(true);
      setVotedFor(approved);
      setVoteData(response);
    } catch (e) {
      console.error('Erro ao votar no desafio', e);
    } finally {
      setIsVoting(false);
    }
  }, [hasVoted, isVoting, voteChallenge, challenge.proof?.id]);

  const proofVote = voteData?.votesByProof?.[0];
  const approvedPct = proofVote?.approvedPercentage ?? 0;
  const rejectedPct = proofVote?.disapprovedPercentage ?? 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.betMeta}>
          {statusBadge ? (
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
              <Ionicons name={statusBadge.icon as any} size={12} color={statusBadge.color} />
              <Text style={[styles.statusText, { color: statusBadge.color }]}>{statusBadge.label}</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(171,71,188,0.15)' }]}>
              <Ionicons name="people-outline" size={12} color="#AB47BC" />
              <Text style={[styles.statusText, { color: '#AB47BC' }]}>Em Julgamento</Text>
            </View>
          )}
          <Text style={[styles.timeAgo, { color: c.textTertiary }]}>{formatTimeAgo(challenge.createdAt)}</Text>
        </View>
        <View style={[styles.buyInBadge, { backgroundColor: c.warningDim }]}>
          <FontAwesome5 name="coins" size={12} color={c.warning} />
          <Text style={[styles.buyInText, { color: c.warning }]}>{challenge.amount}</Text>
        </View>
      </View>

      <Text style={[styles.betTitle, { color: c.text }]}>{challenge.title}</Text>
      <Text style={[styles.betDescription, { color: c.textSecondary }]}>{challenge.description}</Text>

      <View style={[styles.vsContainer, { borderColor: c.border }]}>
        <View style={styles.playerSide}>
          <Avatar name={challengerName} color={"#CCCCCC"} size={36} imageUri={challenge.challenger?.profilePictureUrl} />
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: c.text }]}>{challengerName}</Text>
          </View>
        </View>

        <View style={[styles.vsBadge, { backgroundColor: c.surfaceHighlight }]}>
          <Text style={[styles.vsText, { color: c.accent }]}>VS</Text>
        </View>

        <View style={[styles.playerSide, { alignItems: 'flex-end' }]}>
          <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
            <Text style={{ fontSize: 10, color: c.accent, fontFamily: 'Inter_700Bold', marginBottom: 2 }}>DESAFIADO</Text>
            <Text style={[styles.playerName, { color: c.text }]}>{challengedName}</Text>
          </View>
          <Avatar name={challengedName} color={"#CCCCCC"} size={36} imageUri={challenge.challenged?.profilePictureUrl} />
        </View>
      </View>

      {challenge.proof && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {proofUri ? (
            <ProofMediaFrame
              uri={proofUri}
              backgroundColor={c.surfaceHighlight}
              isVideo={isVideo}
              overlay={
                isVideo ? (
                  <View style={styles.proofMediaOverlay}>
                    <Ionicons name="play" size={20} color="#fff" />
                  </View>
                ) : undefined
              }
            />
          ) : (
            <View
              style={[
                styles.proofMediaPlaceholder,
                { backgroundColor: c.surfaceHighlight, aspectRatio: 3 / 4 },
              ]}
            >
              <Ionicons name="image-outline" size={28} color={c.textTertiary} />
            </View>
          )}
        </View>
      )}

      {!hideVotingControls && !hasVoted && (
        <View style={styles.voteButtons}>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed || isVoting ? 0.7 : 1 }]}
            onPress={() => handleVote(true)}
            disabled={isVoting}
          >
            <Ionicons name="thumbs-up" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>Aprovar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed || isVoting ? 0.7 : 1 }]}
            onPress={() => handleVote(false)}
            disabled={isVoting}
          >
            <Ionicons name="thumbs-down" size={16} color={c.warning} />
            <Text style={[styles.voteBtnText, { color: c.warning }]}>Reprovar</Text>
          </Pressable>
        </View>
      )}

      {voteData && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.voteResults}>
          {voteData.totalVotes === 0 ? (
            <Text style={[styles.totalVotes, { color: c.textTertiary }]}>
              Ainda não há votos registrados
            </Text>
          ) : (
            <>
              <Text style={[styles.totalVotes, { color: c.textTertiary }]}>
                {voteData.totalVotes} {voteData.totalVotes === 1 ? 'voto' : 'votos'}
              </Text>
              <View style={styles.voteBarContainer}>
                <View style={styles.voteBarRow}>
                  {approvedPct > 0 && (
                    <View style={{ flex: approvedPct, backgroundColor: c.accent, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderTopRightRadius: rejectedPct === 0 ? 4 : 0, borderBottomRightRadius: rejectedPct === 0 ? 4 : 0 }} />
                  )}
                  {rejectedPct > 0 && (
                    <View style={{ flex: rejectedPct, backgroundColor: c.danger, borderTopRightRadius: 4, borderBottomRightRadius: 4, borderTopLeftRadius: approvedPct === 0 ? 4 : 0, borderBottomLeftRadius: approvedPct === 0 ? 4 : 0 }} />
                  )}
                </View>
                <View style={styles.voteLabels}>
                  <Text style={[styles.voteLabel, { color: c.accent }]}>{Math.round(approvedPct)}% Aprovado</Text>
                  <Text style={[styles.voteLabel, { color: c.danger }]}>{Math.round(rejectedPct)}% Rejeitado</Text>
                </View>
              </View>
            </>
          )}
        </Animated.View>
      )}

      {challenge.status === 'IN_JUDGMENT' && (
        <CommentSection
          entityType="CHALLENGE"
          entityId={challenge.id}
          commentsData={commentsData}
        />
      )}
    </Animated.View>
  );
}
