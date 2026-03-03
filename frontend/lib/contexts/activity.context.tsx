
import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, FeedItemResponse } from '@/lib/types';
import { feedService } from '@/lib/api/feed.service';
import { activityService } from '@/lib/api/activity.service';
import { useAuth } from '@/lib/contexts';

interface ActivityContextValue {
  activities: Activity[];
  isLoading: boolean;
  voteActivity: (activityId: string, approved: boolean) => void;
  createActivity: (description: string) => void;
  refreshData: () => void;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

const STORAGE_KEYS = {
  ACTIVITIES: '@betdobem_activities',
} as const;

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPersistedData();
  }, [user?.id]);

  async function loadPersistedData() {
    try {
      const activitiesData = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (activitiesData) setActivities(JSON.parse(activitiesData));
    } catch {}
  }

  useEffect(() => {
    let mounted = true;
    async function loadActivitiesFromApi() {
      try {
        const feedItems = await feedService.getMyFeed();
        const mappedActivities: Activity[] = (feedItems || [])
          .filter(it => it.feedItemType === 'ACTIVITY')
          .map((it) => mapFeedItemToActivity(it, user?.id));
        if (!mounted) return;
        setActivities(mappedActivities);
        persistActivities(mappedActivities);
      } catch (e) {
        // ignore
      }
    }

    loadActivitiesFromApi();
    return () => { mounted = false; };
  }, [user?.id]);

  function persistActivities(data: Activity[]) {
    AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data));
  }

  function mapFeedItemToActivity(item: FeedItemResponse | any, currentUserId?: string | number | null): Activity {
    const content = item.content || item;

    const safeUser = (u: any, fallbackId = '') => {
      const idRaw = String(u?.id ?? fallbackId);
      return {
        id: idRaw,
        username: u?.username ?? u?.name ?? u?.displayName ?? `user${idRaw}`,
        displayName: u?.name ?? u?.displayName ?? u?.username ?? `User ${idRaw}`,
        avatarColor: u?.avatarColor ?? '#CCCCCC',
        wins: u?.wins ?? 0,
        losses: u?.losses ?? 0,
        draws: u?.draws ?? 0,
      } as any;
    };

    const mapProof = (p: any) => {
      if (!p) return undefined;
      return {
        id: String(p.id ?? ''),
        userId: String(p.authorId ?? p.userId ?? ''),
        description: p.description ?? '',
        mediaType: (p.contentType && String(p.contentType).startsWith('video')) ? 'video' : 'photo',
        mediaUri: p.imageUrl ? p.imageUrl : (p.mediaUri ?? ''),
        createdAt: p.postedAt ?? p.createdAt ?? new Date().toISOString(),
      } as any;
    };

    const author = content.author || content.authorResponse || content.user;
    const proof = content.proof || content.proofResponse || content.proofs?.[0];
    const authorRaw = safeUser(author, content.authorId ?? '');

    return {
        id: content.id,
        author: authorRaw,
        proof: mapProof(proof),
        description: content.description,
        status: content.status,
        createdAt: content.createdAt,
        closedAt: content.closedAt,
        expiresAt: content.expiresAt,
        group: content.group
    } as Activity;
  }

  const voteActivity = useCallback((activityId: string, approved: boolean) => {
    console.log('vote activity not implemented');
  }, []);

  const createActivity = useCallback(async (description: string) => {
    console.log('create activity not implemented');
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
        const feedItems = await feedService.getMyFeed();
        const mappedActivities: Activity[] = (feedItems || [])
          .filter(it => it.feedItemType === 'ACTIVITY')
          .map((it) => mapFeedItemToActivity(it, user?.id));
        setActivities(mappedActivities);
        persistActivities(mappedActivities);
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ activities, isLoading, voteActivity, createActivity, refreshData }),
    [activities, isLoading, voteActivity, createActivity, refreshData],
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error('useActivity must be used within an ActivityProvider');
  return context;
}
