
import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge, CreateChallengeRequest, PaginatedResponse, CommentResponse, VotePercentageResponse } from '@/lib/types';
import { feedService } from '@/lib/api/feed.service';
import { challengeService } from '@/lib/api/challenge.service';
import { proofService } from '@/lib/api/proof.service';
import { mapFeedItemToChallenge } from '@/lib/utils/feedItemMappers';
import { useAuth } from '@/lib/contexts';

interface ChallengeContextValue {
  challenges: Challenge[];
  challengeCommentsMap: Record<number, PaginatedResponse<CommentResponse>>;
  isLoading: boolean;
  voteChallenge: (proofId: string, approved: boolean) => Promise<VotePercentageResponse>;
  createChallenge: (request: CreateChallengeRequest) => Promise<void>;
  acceptChallenge: (challengeId: string) => Promise<void>;
  declineChallenge: (challengeId: string) => Promise<void>;
  refreshData: () => void;
}

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

const STORAGE_KEYS = {
  CHALLENGES: '@betdobem_challenges',
} as const;

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeCommentsMap, setChallengeCommentsMap] = useState<Record<number, PaginatedResponse<CommentResponse>>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPersistedData();
  }, [user?.id]);

  async function loadPersistedData() {
    try {
      const challengesData = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGES);
      if (challengesData) setChallenges(JSON.parse(challengesData));
    } catch (e) {
      console.error('ChallengeProvider: failed to load persisted data', e);
    }
  }

  useEffect(() => {
    let mounted = true;
    async function loadChallengesFromApi() {
      if (!user?.id) return;
      try {
        const feedItems = await feedService.getMyFeed();
        const challengeFeedItems = (feedItems || []).filter((it) => it.feedItemType === 'CHALLENGE');
        const mappedChallenges: Challenge[] = challengeFeedItems
          .map((it) => mapFeedItemToChallenge(it));
        const commentsMap: Record<number, PaginatedResponse<CommentResponse>> = {};
        challengeFeedItems.forEach((it) => {
          if (it.comments) commentsMap[it.id] = it.comments;
        });
        if (!mounted) return;
        setChallenges(mappedChallenges);
        setChallengeCommentsMap(commentsMap);
        persistChallenges(mappedChallenges);
      } catch (e) {
        console.error('ChallengeProvider: failed to load feed from API', e);
      }
    }

    loadChallengesFromApi();
    return () => { mounted = false; };
  }, [user?.id]);

  function persistChallenges(data: Challenge[]) {
    AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(data));
  }

  const voteChallenge = useCallback(async (proofId: string, approved: boolean): Promise<VotePercentageResponse> => {
    const response = await proofService.voteInProof(proofId, { approved });
    return response;
  }, []);

  const acceptChallenge = useCallback(async (challengeId: string) => {
    await challengeService.acceptChallenge(challengeId);
  }, []);

  const declineChallenge = useCallback(async (challengeId: string) => {
    await challengeService.declineChallenge(challengeId);
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user?.id) return;
      const feedItems = await feedService.getMyFeed();
      const challengeFeedItems = (feedItems || []).filter((it) => it.feedItemType === 'CHALLENGE');
      const mappedChallenges: Challenge[] = challengeFeedItems
        .map((it) => mapFeedItemToChallenge(it));
      const commentsMap: Record<number, PaginatedResponse<CommentResponse>> = {};
      challengeFeedItems.forEach((it) => {
        if (it.comments) commentsMap[it.id] = it.comments;
      });
      setChallenges(mappedChallenges);
      setChallengeCommentsMap(commentsMap);
      persistChallenges(mappedChallenges);
    } catch (e) {
      console.error('ChallengeProvider: failed to refresh feed', e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createChallenge = useCallback(
    async (request: CreateChallengeRequest) => {
      try {
        await challengeService.createChallenge(request);
        await refreshData();
      } catch (e) {
        console.error('Erro ao criar desafio', e);
        throw e;
      }
    },
    [refreshData],
  );

  const value = useMemo(
    () => ({ challenges, challengeCommentsMap, isLoading, voteChallenge, createChallenge, refreshData, acceptChallenge, declineChallenge }),
    [challenges, challengeCommentsMap, isLoading, voteChallenge, createChallenge, refreshData, acceptChallenge, declineChallenge],
  );

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
}

export function useChallenge() {
  const context = useContext(ChallengeContext);
  if (!context) throw new Error('useChallenge must be used within a ChallengeProvider');
  return context;
}
