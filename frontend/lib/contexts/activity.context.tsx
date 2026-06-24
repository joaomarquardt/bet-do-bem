
import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, CreateActivityRequest, FeedItemResponse, PaginatedResponse, CommentResponse, VotePercentageResponse } from '@/lib/types';
import { feedService } from '@/lib/api/feed.service';
import { activityService } from '@/lib/api/activity.service';
import { proofService } from '@/lib/api/proof.service';
import { uploadToPresignedUrl } from '@/lib/utils/uploadFileToAWS';
import { useAuth } from '@/lib/contexts';

interface ActivityContextValue {
  activities: Activity[];
  activityCommentsMap: Record<number, PaginatedResponse<CommentResponse>>;
  isLoading: boolean;
  voteActivity: (proofId: string, approved: boolean) => Promise<VotePercentageResponse>;
  createActivity: (
    request: CreateActivityRequest,
    file: File | { uri: string; type?: string },
  ) => Promise<void>;
  refreshData: () => void;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

const STORAGE_KEYS = {
  ACTIVITIES: '@betdobem_activities',
} as const;

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityCommentsMap, setActivityCommentsMap] = useState<Record<number, PaginatedResponse<CommentResponse>>>({});
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
      if (!user?.id) return;
      try {
        const feedItems = await feedService.getMyFeed();
        const activityFeedItems = (feedItems || []).filter(it => it.feedItemType === 'ACTIVITY');
        const mappedActivities: Activity[] = activityFeedItems
          .map((it) => mapFeedItemToActivity(it, user?.id));
        const commentsMap: Record<number, PaginatedResponse<CommentResponse>> = {};
        activityFeedItems.forEach((it) => {
          if (it.comments) commentsMap[it.id] = it.comments;
        });
        if (!mounted) return;
        setActivities(mappedActivities);
        setActivityCommentsMap(commentsMap);
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
        name: u?.name ?? u?.displayName ?? u?.username ?? `User ${idRaw}`,
        email: u?.email ?? '',
        username: u?.username ?? u?.name ?? u?.displayName ?? `user${idRaw}`,
        displayName: u?.displayName ?? u?.name ?? u?.username ?? `User ${idRaw}`,
        avatarColor: u?.avatarColor ?? '#CCCCCC',
        wins: u?.wins ?? 0,
        losses: u?.losses ?? 0,
        draws: u?.draws ?? 0,
      } as any;
    };

    const mapProof = (p: any) => {
      if (!p) return undefined;
      return {
        id: Number(p.id ?? 0),
        imageUrl: p.imageUrl ?? p.mediaUri ?? '',
        contentType: p.contentType ?? '',
        fileName: p.fileName ?? '',
        postedAt: p.postedAt ?? p.createdAt ?? new Date().toISOString(),
        author: safeUser(p.author, p.authorId ?? p.userId ?? ''),
        comments: p.comments ?? [],
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

  const voteActivity = useCallback(async (proofId: string, approved: boolean): Promise<VotePercentageResponse> => {
    const response = await proofService.voteInProof(proofId, { approved });
    return response;
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
        if (!user?.id) return;
        const feedItems = await feedService.getMyFeed();
        const activityFeedItems = (feedItems || []).filter(it => it.feedItemType === 'ACTIVITY');
        const mappedActivities: Activity[] = activityFeedItems
          .map((it) => mapFeedItemToActivity(it, user?.id));
        const commentsMap: Record<number, PaginatedResponse<CommentResponse>> = {};
        activityFeedItems.forEach((it) => {
          if (it.comments) commentsMap[it.id] = it.comments;
        });
        setActivities(mappedActivities);
        setActivityCommentsMap(commentsMap);
        persistActivities(mappedActivities);
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createActivity = useCallback(
    async (request: CreateActivityRequest, file: File | { uri: string; type?: string }) => {
      try {
        const { uploadUrl } = await activityService.createActivity(request);
        await uploadToPresignedUrl(uploadUrl, file, request.proof.contentType);
        await refreshData();
      } catch (e) {
        console.error('Erro ao criar atividade', e);
        throw e;
      }
    },
    [refreshData],
  );

  const value = useMemo(
    () => ({ activities, activityCommentsMap, isLoading, voteActivity, createActivity, refreshData }),
    [activities, activityCommentsMap, isLoading, voteActivity, createActivity, refreshData],
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error('useActivity must be used within an ActivityProvider');
  return context;
}
