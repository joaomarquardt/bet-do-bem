
import { useState, useCallback } from 'react';
import { View, Text, Pressable, Platform, UIManager } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { Challenge } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils/formatters';
import { useChallenge } from '@/lib/contexts';
import { styles } from './BetCard.styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
}

export function ChallengeCard({ challenge, index }: ChallengeCardProps) {
  const { voteChallenge } = useChallenge();
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<boolean | null>(null);
  const c = Colors.dark;

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
          <Avatar name={challenge.challenger?.name ?? '?'} color={"#CCCCCC"} size={36} />
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: c.text }]}>{challenge.challenger?.name ?? '...'}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{challenge.challenger?.email ?? '...'}</Text>
          </View>
        </View>

        <View style={[styles.vsBadge, { backgroundColor: c.surfaceHighlight }]}>
          <Text style={[styles.vsText, { color: c.accent }]}>VS</Text>
        </View>

        <View style={[styles.playerSide, { alignItems: 'flex-end' }]}>
          <View style={[styles.playerInfo, { alignItems: 'flex-end' }]}>
            <Text style={[styles.playerName, { color: c.text }]}>{challenge.challenged?.name ?? '...'}</Text>
            <Text style={[styles.playerUsername, { color: c.textTertiary }]}>@{challenge.challenged?.email ?? '...'}</Text>
          </View>
          <Avatar name={challenge.challenged?.name ?? '?'} color={"#CCCCCC"} size={36} />
        </View>
      </View>

      {challenge.proof && (
        <View style={[styles.proofCard, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}>
          <View style={styles.proofHeader}>
            <Avatar name={challenge.challenger?.name ?? '?'} color={"#CCCCCC"} size={24} />
            <Text style={[styles.proofAuthor, { color: c.textSecondary }]}>{challenge.challenger?.name ?? '...'}</Text>
          </View>
          <View style={[styles.proofMediaPlaceholder, { backgroundColor: c.surfaceHighlight }]}>
            <Ionicons name="image-outline" size={28} color={c.textTertiary} />
          </View>
          <Text style={[styles.proofText, { color: c.text }]}>{challenge.proof?.imageUrl}</Text>
        </View>
      )}

      {!hasVoted && (
        <View style={styles.voteButtons}>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleVote(true)}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{challenge.challenger?.name ?? '...'}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleVote(false)}
          >
            <Ionicons name="trophy" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>{challenge.challenged?.name ?? '...'}</Text>
          </Pressable>
        </View>
      )}

      {hasVoted && (
        <View style={styles.voteResults}>
            <Text style={[styles.totalVotes, { color: c.textTertiary }]}>Voto computado!</Text>
        </View>
      )}
    </Animated.View>
  );
}
