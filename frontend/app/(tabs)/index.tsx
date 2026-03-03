
import { useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { BetCard } from '@/components/feed/BetCard';
import { ActivityCard } from '@/components/feed/ActivityCard';
import { ChallengeCard } from '@/components/feed/ChallengeCard';
import { useBets, useActivity, useChallenge } from '@/lib/contexts';
import { Bet, Activity, Challenge } from '@/lib/types';
import { styles } from '@/styles/tabs/feed.styles';

const c = Colors.dark;

export default function FeedScreen() {
  const { feedBets, isLoading: betsLoading, refreshData: refreshBets } = useBets();
  const { activities, isLoading: activitiesLoading, refreshData: refreshActivities } = useActivity();
  const { challenges, isLoading: challengesLoading, refreshData: refreshChallenges } = useChallenge();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const feed = useMemo(() => {
    const betsWithFeedType = feedBets.map(bet => ({ ...bet, feedItemType: 'BET' as const }));
    const activitiesWithFeedType = activities.map(activity => ({ ...activity, feedItemType: 'ACTIVITY' as const }));
    const challengesWithFeedType = challenges.map(challenge => ({ ...challenge, feedItemType: 'CHALLENGE' as const }));
    return [...betsWithFeedType, ...activitiesWithFeedType, ...challengesWithFeedType].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [feedBets, activities, challenges]);
  
  const isLoading = betsLoading || activitiesLoading || challengesLoading;

  const refreshData = useCallback(() => {
    refreshBets();
    refreshActivities();
    refreshChallenges();
  }, [refreshBets, refreshActivities, refreshChallenges]);

  const renderItem = useCallback(({ item, index }: { item: (Bet | Activity | Challenge) & { feedItemType: 'BET' | 'ACTIVITY' | 'CHALLENGE' }; index: number }) => {
    if (item.feedItemType === 'ACTIVITY') return <ActivityCard activity={item as Activity} index={index} />;
    if (item.feedItemType === 'CHALLENGE') return <ChallengeCard challenge={item as Challenge} index={index} />;
    return <BetCard bet={item as Bet} index={index} />;
  }, []);

  const keyExtractor = useCallback((item: (Bet | Activity | Challenge) & { feedItemType: 'BET' | 'ACTIVITY' | 'CHALLENGE' }) => `${item.feedItemType}-${item.id.toString()}`, []);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: c.text }]}>Feed</Text>
          <Text style={[styles.headerSubtitle, { color: c.textSecondary }]}>Julgue as apostas da comunidade</Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: c.accentDim }]}>
          <View style={[styles.liveDot, { backgroundColor: c.accent }]} />
          <Text style={[styles.liveText, { color: c.accent }]}>AO VIVO</Text>
        </View>
      </View>
      <FlatList
        data={feed}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 84 : 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!feed.length}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} tintColor={c.accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="telescope-outline" size={48} color={c.textTertiary} />
            <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>Nenhuma aposta para julgar</Text>
            <Text style={[styles.emptyText, { color: c.textTertiary }]}>Volte mais tarde para novas apostas</Text>
          </View>
        }
      />
    </View>
  );
}
