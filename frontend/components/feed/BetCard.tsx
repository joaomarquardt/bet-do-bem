import { useState, useCallback } from 'react';
import { View, Text, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { Bet } from '@/lib/types';
import { formatTimeAgo, formatDeadline } from '@/lib/utils/formatters';
import { useBets } from '@/lib/contexts';
import { styles } from './BetCard.styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BetCardProps {
  bet: Bet;
  index: number;
}

export function BetCard({ bet, index }: BetCardProps) {
  const { voteBet } = useBets();
  const [showComments, setShowComments] = useState(false);
  const [hasVoted, setHasVoted] = useState(!!bet.myVote);
  const [votedFor, setVotedFor] = useState<string | null>(bet.myVote || null);
  const c = Colors.dark;

  const totalVotes = bet.votes.creatorVotes + bet.votes.opponentVotes;
  const creatorPercent = totalVotes > 0 ? Math.round((bet.votes.creatorVotes / totalVotes) * 100) : 50;
  const opponentPercent = 100 - creatorPercent;

  const handleVote = useCallback(
    (userId: string) => {
      if (hasVoted) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setHasVoted(true);
      setVotedFor(userId);
      voteBet(bet.id, userId);
    },
    [hasVoted, bet.id, voteBet],
  );

  const toggleComments = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowComments((prev) => !prev);
  }, []);

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
          <Avatar name={bet.creator.displayName} color={bet.creator.avatarColor} size={36} />
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: c.text }]}>{bet.creator.displayName}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{bet.creator.username}</Text>
          </View>
        </View>
        <View style={[styles.vsBadge, { backgroundColor: c.surfaceHighlight }]}>
          <Text style={[styles.vsText, { color: c.accent }]}>VS</Text>
        </View>
        <View style={[styles.playerSide, { alignItems: 'flex-end' }]}>
          <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
            <Text style={[styles.playerName, { color: c.text }]}>{bet.opponent.displayName}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{bet.opponent.username}</Text>
          </View>
          <Avatar name={bet.opponent.displayName} color={bet.opponent.avatarColor} size={36} />
        </View>
      </View>

      {bet.creatorProof && bet.opponentProof && (
        <View style={styles.proofsContainer}>
          <View style={[styles.proofCard, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}>
            <View style={styles.proofHeader}>
              <Avatar name={bet.creator.displayName} color={bet.creator.avatarColor} size={24} />
              <Text style={[styles.proofAuthor, { color: c.textSecondary }]}>{bet.creator.username}</Text>
            </View>
            <View style={[styles.proofMediaPlaceholder, { backgroundColor: c.surfaceHighlight }]}>
              <Ionicons name="videocam" size={28} color={c.textTertiary} />
            </View>
            <Text style={[styles.proofText, { color: c.text }]}>{bet.creatorProof.description}</Text>
          </View>

          <View style={[styles.proofCard, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}>
            <View style={styles.proofHeader}>
              <Avatar name={bet.opponent.displayName} color={bet.opponent.avatarColor} size={24} />
              <Text style={[styles.proofAuthor, { color: c.textSecondary }]}>{bet.opponent.username}</Text>
            </View>
            <View style={[styles.proofMediaPlaceholder, { backgroundColor: c.surfaceHighlight }]}>
              <Ionicons name="videocam" size={28} color={c.textTertiary} />
            </View>
            <Text style={[styles.proofText, { color: c.text }]}>{bet.opponentProof.description}</Text>
          </View>
        </View>
      )}

      {hasVoted && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.voteResults}>
          <View style={styles.voteBarContainer}>
            <View style={[styles.voteBarBg, { backgroundColor: c.surfaceHighlight }]}>
              <View
                style={[
                  styles.voteBarFill,
                  { width: `${creatorPercent}%`, backgroundColor: votedFor === bet.creatorId ? c.accent : c.textTertiary },
                ]}
              />
            </View>
            <View style={styles.voteLabels}>
              <Text style={[styles.voteLabel, { color: votedFor === bet.creatorId ? c.accent : c.textSecondary }]}>
                {bet.creator.username} {creatorPercent}%
              </Text>
              <Text style={[styles.voteLabel, { color: votedFor === bet.opponentId ? c.accent : c.textSecondary }]}>
                {opponentPercent}% {bet.opponent.username}
              </Text>
            </View>
          </View>
          <Text style={[styles.totalVotes, { color: c.textTertiary }]}>{totalVotes} votos</Text>
        </Animated.View>
      )}

      {!hasVoted && (
        <View style={styles.voteButtons}>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleVote(bet.creatorId)}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{bet.creator.username}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleVote(bet.opponentId)}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{bet.opponent.username}</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.cardFooter, { borderTopColor: c.border }]}>
        <Pressable style={styles.footerAction} onPress={toggleComments}>
          <Ionicons name="chatbubble-outline" size={18} color={c.textSecondary} />
          <Text style={[styles.footerText, { color: c.textSecondary }]}>{bet.comments.length}</Text>
        </Pressable>
        <View style={styles.footerAction}>
          <Ionicons name="time-outline" size={18} color={c.textTertiary} />
          <Text style={[styles.footerText, { color: c.textTertiary }]}>{formatDeadline(bet.deadline)}</Text>
        </View>
      </View>

      {showComments && bet.comments.length > 0 && (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.commentsSection, { borderTopColor: c.border }]}>
          {bet.comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Text style={[styles.commentAuthor, { color: c.accent }]}>@{comment.username}</Text>
              <Text style={[styles.commentText, { color: c.textSecondary }]}>{comment.text}</Text>
            </View>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}
