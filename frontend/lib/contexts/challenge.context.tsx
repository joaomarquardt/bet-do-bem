
import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge, CreateChallengeRequest } from '@/lib/types';
import { feedService } from '@/lib/api/feed.service';
import { challengeService } from '@/lib/api/challenge.service';
import { mapFeedItemToChallenge } from '@/lib/utils/feedItemMappers';
import { useAuth } from '@/lib/contexts';

interface ChallengeContextValue {
  challenges: Challenge[];
  isLoading: boolean;
  voteChallenge: (challengeId: string, approved: boolean) => void;
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
        const mappedChallenges: Challenge[] = (feedItems || [])
          .filter((it) => it.feedItemType === 'CHALLENGE')
          .map((it) => mapFeedItemToChallenge(it));
        if (!mounted) return;
        setChallenges(mappedChallenges);
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

  const voteChallenge = useCallback((challengeId: string, approved: boolean) => {
    console.log('vote challenge not implemented');
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
      const mappedChallenges: Challenge[] = (feedItems || [])
        .filter((it) => it.feedItemType === 'CHALLENGE')
        .map((it) => mapFeedItemToChallenge(it));
      setChallenges(mappedChallenges);
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
    () => ({ challenges, isLoading, voteChallenge, createChallenge, refreshData, acceptChallenge, declineChallenge }),
    [challenges, isLoading, voteChallenge, createChallenge, refreshData, acceptChallenge, declineChallenge],
  );

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
}

export function useChallenge() {
  const context = useContext(ChallengeContext);
  if (!context) throw new Error('useChallenge must be used within a ChallengeProvider');
  return context;
}
