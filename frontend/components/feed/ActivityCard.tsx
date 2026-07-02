
import { useState, useCallback } from 'react';
import { View, Text, Pressable, Platform, UIManager } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { ProofMediaFrame } from '@/components/feed/ProofMediaFrame';
import { CommentSection } from '@/components/feed/CommentSection';
import { Activity, PaginatedResponse, CommentResponse, VotePercentageResponse } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils/formatters';
import { useActivity } from '@/lib/contexts';
import { styles } from './BetCard.styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ActivityCardProps {
  activity: Activity;
  index: number;
  commentsData: PaginatedResponse<CommentResponse> | null;
  hideVotingControls?: boolean;
  statusBadge?: { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap | keyof typeof Ionicons.glyphMap; color: string; bg: string };
  initialVoteData?: VotePercentageResponse | null;
}

export function ActivityCard({ activity, index, commentsData, hideVotingControls, statusBadge, initialVoteData }: ActivityCardProps) {
  const { voteActivity } = useActivity();
  const [hasVoted, setHasVoted] = useState(!!initialVoteData);
  const [votedFor, setVotedFor] = useState<boolean | null>(null);
  const [voteData, setVoteData] = useState<VotePercentageResponse | null>(initialVoteData || null);
  const [isVoting, setIsVoting] = useState(false);
  const c = Colors.dark;
  const authorName =
    activity.author?.name ?? (activity.author as any)?.displayName ?? (activity.author as any)?.username ?? '...';
  const authorUsername = (activity.author as any)?.username ?? authorName;
  const proofUri = activity.proof?.imageUrl ?? (activity.proof as any)?.mediaUri ?? '';
  const isVideo =
    String(activity.proof?.contentType ?? '').toLowerCase().startsWith('video') ||
    /\.(mp4|mov|webm|mkv)$/i.test(proofUri);

  const handleVote = useCallback(async (approved: boolean) => {
    if (hasVoted || isVoting) return;
    const proofId = activity.proof?.id;
    if (proofId == null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVoting(true);
    try {
      const response = await voteActivity(String(proofId), approved);
      setHasVoted(true);
      setVotedFor(approved);
      setVoteData(response);
    } catch (e) {
      console.error('Erro ao votar na atividade', e);
    } finally {
      setIsVoting(false);
    }
  }, [hasVoted, isVoting, voteActivity, activity.proof?.id]);

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
            <View style={[styles.statusBadge, { backgroundColor: c.accentDim }]}>
              <MaterialCommunityIcons name="image" size={12} color={c.accent} />
              <Text style={[styles.statusText, { color: c.accent }]}>Atividade</Text>
            </View>
          )}
          <Text style={[styles.timeAgo, { color: c.textTertiary }]}>{formatTimeAgo(activity.createdAt)}</Text>
        </View>
        <View style={[styles.buyInBadge, { backgroundColor: c.surfaceHighlight }]}>
          <Text style={[styles.buyInText, { color: c.textTertiary }]}>ACTIVITY</Text>
        </View>
      </View>

      <Text style={[styles.betDescription, { color: c.textSecondary }]}>{activity.description}</Text>

      <View style={[styles.vsContainer, { borderColor: c.border, borderBottomWidth: 0 }]}>
        <View style={styles.playerSide}>
          <Avatar name={authorName} color={"#CCCCCC"} size={36} />
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: c.text }]}>{authorName}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{authorUsername}</Text>
          </View>
        </View>
      </View>

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
              {
                backgroundColor: c.surfaceHighlight,
                aspectRatio: 3 / 4,
              },
            ]}
          >
            <Ionicons name="image-outline" size={28} color={c.textTertiary} />
          </View>
        )}
      </View>

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

      {activity.status === 'IN_JUDGMENT' && (
        <CommentSection
          entityType="ACTIVITY"
          entityId={activity.id}
          commentsData={commentsData}
        />
      )}
    </Animated.View>
  );
}

