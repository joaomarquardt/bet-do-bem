
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
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const c = Colors.dark;

  const handleVote = useCallback(
    (userId: string) => {
      if (hasVoted) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setHasVoted(true);
      setVotedFor(userId);
      voteBet(bet.id.toString(), userId);
    },
    [hasVoted, bet.id, voteBet],
  );

  const toggleComments = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowComments((prev) => !prev);
  }, []);

  const creatorProof = bet.proofs?.find(p => p.author?.id === bet.creator?.id);
  const opponentProof = bet.proofs?.find(p => p.author?.id === bet.opponent?.id);

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
          <Avatar name={bet.creator?.name ?? '?'} color={"#CCCCCC"} size={36} />
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: c.text }]}>{bet.creator?.name ?? '...'}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{bet.creator?.name ?? '...'}</Text>
          </View>
        </View>
        <View style={[styles.vsBadge, { backgroundColor: c.surfaceHighlight }]}>
          <Text style={[styles.vsText, { color: c.accent }]}>VS</Text>
        </View>
        <View style={[styles.playerSide, { alignItems: 'flex-end' }]}>
          <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
            <Text style={[styles.playerName, { color: c.text }]}>{bet.opponent?.name ?? '...'}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{bet.opponent?.name ?? '...'}</Text>
          </View>
          <Avatar name={bet.opponent?.name ?? '?'} color={"#CCCCCC"} size={36} />
        </View>
      </View>

      {creatorProof && opponentProof && (
        <View style={styles.proofsContainer}>
          <View style={[styles.proofCard, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}>
            <View style={styles.proofHeader}>
              <Avatar name={bet.creator?.name ?? '?'} color={"#CCCCCC"} size={24} />
              <Text style={[styles.proofAuthor, { color: c.textSecondary }]}>{bet.creator?.name ?? '...'}</Text>
            </View>
            <View style={[styles.proofMediaPlaceholder, { backgroundColor: c.surfaceHighlight }]}>
              <Ionicons name="videocam" size={28} color={c.textTertiary} />
            </View>
            <Text style={[styles.proofText, { color: c.text }]}>{creatorProof.imageUrl}</Text>
          </View>

          <View style={[styles.proofCard, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}>
            <View style={styles.proofHeader}>
              <Avatar name={bet.opponent?.name ?? '?'} color={"#CCCCCC"} size={24} />
              <Text style={[styles.proofAuthor, { color: c.textSecondary }]}>{bet.opponent?.name ?? '...'}</Text>
            </View>
            <View style={[styles.proofMediaPlaceholder, { backgroundColor: c.surfaceHighlight }]}>
              <Ionicons name="videocam" size={28} color={c.textTertiary} />
            </View>
            <Text style={[styles.proofText, { color: c.text }]}>{opponentProof.imageUrl}</Text>
          </View>
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
            onPress={() => handleVote(bet.creator.id.toString())}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{bet.creator.name}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleVote(bet.opponent.id.toString())}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{bet.opponent.name}</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.cardFooter, { borderTopColor: c.border }]}>
        <Pressable style={styles.footerAction} onPress={toggleComments}>
          <Ionicons name="chatbubble-outline" size={18} color={c.textSecondary} />
          <Text style={[styles.footerText, { color: c.textSecondary }]}>0</Text>
        </Pressable>
        <View style={styles.footerAction}>
          <Ionicons name="time-outline" size={18} color={c.textTertiary} />
          <Text style={[styles.footerText, { color: c.textTertiary }]}>{formatDeadline(bet.expiresAt)}</Text>
        </View>
      </View>

      {showComments && (
        <Animated.View entering={FadeIn.duration(200)} style={[styles.commentsSection, { borderTopColor: c.border }]}>
        </Animated.View>
      )}
    </Animated.View>
  );
}
