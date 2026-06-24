
import { useState, useCallback } from 'react';
import { View, Text, Pressable, Platform, UIManager } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { ProofMediaFrame } from '@/components/feed/ProofMediaFrame';
import { CommentSection } from '@/components/feed/CommentSection';
import { Challenge, PaginatedResponse, CommentResponse } from '@/lib/types';
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
}

export function ChallengeCard({ challenge, index, commentsData }: ChallengeCardProps) {
  const { voteChallenge } = useChallenge();
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<boolean | null>(null);
  const c = Colors.dark;
  const challengerName =
    challenge.challenger?.name ??
    (challenge.challenger as any)?.displayName ??
    (challenge.challenger as any)?.username ??
    '...';
  const challengedName =
    challenge.challenged?.name ??
    (challenge.challenged as any)?.displayName ??
    (challenge.challenged as any)?.username ??
    '...';
  const challengerEmail = challenge.challenger?.email ?? (challenge.challenger as any)?.username ?? '...';
  const challengedEmail = challenge.challenged?.email ?? (challenge.challenged as any)?.username ?? '...';
  const proofUri = challenge.proof?.imageUrl ?? (challenge.proof as any)?.mediaUri ?? '';
  const isVideo =
    String(challenge.proof?.contentType ?? '').toLowerCase().startsWith('video') ||
    /\.(mp4|mov|webm|mkv)$/i.test(proofUri);

  const handleVote = useCallback((approved: boolean) => {
    if (hasVoted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHasVoted(true);
    setVotedFor(approved);
    voteChallenge(challenge.id.toString(), approved);
  }, [hasVoted, voteChallenge, challenge.id]);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.betMeta}>
          <View style={[styles.statusBadge, { backgroundColor: c.accentDim }]}>
            <MaterialCommunityIcons name="handshake" size={12} color={c.accent} />
            <Text style={[styles.statusText, { color: c.accent }]}>Desafio</Text>
          </View>
          <Text style={[styles.timeAgo, { color: c.textTertiary }]}>{formatTimeAgo(challenge.createdAt)}</Text>
        </View>
        <View style={[styles.buyInBadge, { backgroundColor: c.warningDim }]}>
          <MaterialCommunityIcons name="currency-usd" size={14} color={c.warning} />
          <Text style={[styles.buyInText, { color: c.warning }]}>{challenge.amount}</Text>
        </View>
      </View>

      <Text style={[styles.betTitle, { color: c.text }]}>{challenge.title}</Text>
      <Text style={[styles.betDescription, { color: c.textSecondary }]}>{challenge.description}</Text>

      <View style={[styles.vsContainer, { borderColor: c.border }]}>
        <View style={styles.playerSide}>
          <Avatar name={challengerName} color={"#CCCCCC"} size={36} />
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: c.text }]}>{challengerName}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{challengerEmail}</Text>
          </View>
        </View>

        <View style={[styles.vsBadge, { backgroundColor: c.surfaceHighlight }]}>
          <Text style={[styles.vsText, { color: c.accent }]}>VS</Text>
        </View>

        <View style={[styles.playerSide, { alignItems: 'flex-end' }]}>
          <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
            <Text style={[styles.playerName, { color: c.text }]}>{challengedName}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{challengedEmail}</Text>
          </View>
          <Avatar name={challengedName} color={"#CCCCCC"} size={36} />
        </View>
      </View>

      {challenge.proof && (
        <View style={[styles.proofCard, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}>
          <View style={styles.proofHeader}>
            <Avatar name={challengerName} color={"#CCCCCC"} size={24} />
            <Text style={[styles.proofAuthor, { color: c.textSecondary }]}>{challengerName}</Text>
          </View>
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

      {!hasVoted && (
        <View style={styles.voteButtons}>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleVote(true)}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{challengerName}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleVote(false)}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{challengedName}</Text>
          </Pressable>
        </View>
      )}

      {hasVoted && (
        <View style={styles.voteResults}>
            <Text style={[styles.totalVotes, { color: c.textTertiary }]}>Voto computado!</Text>
        </View>
      )}

      <CommentSection
        entityType="CHALLENGE"
        entityId={challenge.id}
        commentsData={commentsData}
      />
    </Animated.View>
  );
}
