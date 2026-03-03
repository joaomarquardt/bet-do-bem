
import { useState, useCallback } from 'react';
import { View, Text, Pressable, Platform, UIManager } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { Activity } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils/formatters';
import { useActivity } from '@/lib/contexts';
import { styles } from './BetCard.styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

export function ActivityCard({ activity, index }: ActivityCardProps) {
  const { voteActivity } = useActivity();
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<boolean | null>(null);
  const c = Colors.dark;

  const handleVote = useCallback((approved: boolean) => {
    if (hasVoted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHasVoted(true);
    setVotedFor(approved);
    voteActivity(activity.id.toString(), approved);
  }, [hasVoted, voteActivity, activity.id]);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.betMeta}>
          <View style={[styles.statusBadge, { backgroundColor: c.accentDim }]}>
            <MaterialCommunityIcons name="image" size={12} color={c.accent} />
            <Text style={[styles.statusText, { color: c.accent }]}>Atividade</Text>
          </View>
          <Text style={[styles.timeAgo, { color: c.textTertiary }]}>{formatTimeAgo(activity.createdAt)}</Text>
        </View>
        <View style={[styles.buyInBadge, { backgroundColor: c.surfaceHighlight }]}>
          <Text style={[styles.buyInText, { color: c.textTertiary }]}>ACTIVITY</Text>
        </View>
      </View>

      <Text style={[styles.betDescription, { color: c.textSecondary }]}>{activity.description}</Text>

      <View style={[styles.proofCard, { backgroundColor: c.surfaceElevated, borderColor: c.border, marginTop: 12 }]}>
        <View style={styles.proofHeader}>
          <Avatar name={activity.author?.name ?? '?'} color={"#CCCCCC"} size={28} />
          <Text style={[styles.proofAuthor, { color: c.textSecondary }]}>{activity.author?.name ?? '...'}</Text>
        </View>
        <View style={[styles.proofMediaPlaceholder, { backgroundColor: c.surfaceHighlight, marginTop: 8 }]}>
          <Ionicons name="image-outline" size={28} color={c.textTertiary} />
        </View>
        {activity.proof && <Text style={[styles.proofText, { color: c.text }]}>{activity.proof.imageUrl}</Text>}
      </View>

      {!hasVoted && (
        <View style={styles.voteButtons}>
          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleVote(true)}
          >
            <Ionicons name="thumbs-up" size={16} color={c.accent} />
            <Text style={[styles.voteBtnText, { color: c.accent }]}>Aprovar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.voteBtn, { backgroundColor: c.surfaceElevated, borderColor: c.accentBorder, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleVote(false)}
          >
            <Ionicons name="thumbs-down" size={16} color={c.warning} />
            <Text style={[styles.voteBtnText, { color: c.warning }]}>Reprovar</Text>
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

