import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { BetCard } from '@/components/feed/BetCard';
import { ActivityCard } from '@/components/feed/ActivityCard';
import { ChallengeCard } from '@/components/feed/ChallengeCard';
import { useBets, useActivity, useChallenge } from '@/lib/contexts';
import { friendInviteService, groupInviteService } from '@/lib/api';
import { Bet, Activity, Challenge, PaginatedResponse, CommentResponse } from '@/lib/types';
import { styles } from '@/styles/tabs/feed.styles';
import { NotificationsSidebar } from '@/components/ui/NotificationsSidebar';

const c = Colors.dark;

type FeedItemWithType = (Bet | Activity | Challenge) & {
  feedItemType: 'BET' | 'ACTIVITY' | 'CHALLENGE';
  commentsData?: PaginatedResponse<CommentResponse> | null;
};

export default function GroupFeedScreen() {
  const { feedBets, betCommentsMap, isLoading: betsLoading, refreshData: refreshBets } = useBets();
  const { activities, activityCommentsMap, isLoading: activitiesLoading, refreshData: refreshActivities } = useActivity();
  const { challenges, challengeCommentsMap, isLoading: challengesLoading, refreshData: refreshChallenges } = useChallenge();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadPendingInvites = async () => {
        try {
          const [friends, groups] = await Promise.all([
            friendInviteService.getMyPendingInvites(),
            groupInviteService.getMyPendingInvites()
          ]);
          if (isActive) {
            setPendingInvitesCount(friends.length + groups.length);
          }
        } catch (e) {
          console.error('Failed to load pending invites for badge', e);
        }
      };

      loadPendingInvites();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const feed = useMemo<FeedItemWithType[]>(() => {
    const betsWithFeedType: FeedItemWithType[] = feedBets.map((bet) => ({
      ...bet,
      feedItemType: 'BET',
      commentsData: betCommentsMap[bet.id] ?? null,
    }));
    const activitiesWithFeedType: FeedItemWithType[] = activities.map((activity) => ({
      ...activity,
      feedItemType: 'ACTIVITY',
      commentsData: activityCommentsMap[activity.id] ?? null,
    }));
    const challengesWithFeedType: FeedItemWithType[] = challenges.map((challenge) => ({
      ...challenge,
      feedItemType: 'CHALLENGE',
      commentsData: challengeCommentsMap[challenge.id] ?? null,
    }));

    return [...betsWithFeedType, ...activitiesWithFeedType, ...challengesWithFeedType]
      .filter((item) => item.status === 'IN_JUDGMENT');
  }, [feedBets, activities, challenges, betCommentsMap, activityCommentsMap, challengeCommentsMap]);

  const isLoading = betsLoading || activitiesLoading || challengesLoading;

  const refreshData = useCallback(() => {
    refreshBets();
    refreshActivities();
    refreshChallenges();
  }, [refreshBets, refreshActivities, refreshChallenges]);

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItemWithType; index: number }) => {
      if (item.feedItemType === 'ACTIVITY') {
        return <ActivityCard activity={item as Activity} index={index} commentsData={item.commentsData ?? null} />;
      }
      if (item.feedItemType === 'CHALLENGE') {
        return <ChallengeCard challenge={item as Challenge} index={index} commentsData={item.commentsData ?? null} />;
      }
      return <BetCard bet={item as Bet} index={index} commentsData={item.commentsData ?? null} />;
    },
    [],
  );

  const keyExtractor = useCallback(
    (item: FeedItemWithType) => `${item.feedItemType}-${item.id.toString()}`,
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: c.text }]}>Feed</Text>
          <Text style={[styles.headerSubtitle, { color: c.textSecondary }]}>
            Julgue as apostas da comunidade
          </Text>
        </View>
        <TouchableOpacity style={[styles.liveBadge, { backgroundColor: c.surface, position: 'relative' }]} onPress={() => setIsSidebarVisible(true)}>
          <Ionicons name="notifications-outline" size={24} color={c.text} />
          {pendingInvitesCount > 0 && (
            <View style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: c.danger,
              borderRadius: 10,
              minWidth: 18,
              height: 18,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: c.background
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                {pendingInvitesCount > 99 ? '99+' : pendingInvitesCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <FlatList
        data={feed}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === 'web' ? 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!feed.length}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            tintColor={c.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="telescope-outline"
              size={48}
              color={c.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>
              Nenhuma aposta para julgar
            </Text>
            <Text style={[styles.emptyText, { color: c.textTertiary }]}>
              Volte mais tarde para novas apostas
            </Text>
            <View style={{ height: 100 }} />
          </View>
        }
      />
      <NotificationsSidebar visible={isSidebarVisible} onClose={() => setIsSidebarVisible(false)} />
    </View>
  );
}
