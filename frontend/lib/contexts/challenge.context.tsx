
import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Challenge, CreateChallengeRequest, FeedItemResponse } from '@/lib/types';
import { feedService } from '@/lib/api/feed.service';
import { challengeService } from '@/lib/api/challenge.service';
import { useAuth } from '@/lib/contexts';

interface ChallengeContextValue {
  challenges: Challenge[];
  isLoading: boolean;
  voteChallenge: (challengeId: string, approved: boolean) => void;
  createChallenge: (request: CreateChallengeRequest) => Promise<void>;
  acceptChallenge: (challengeId: string) => void;
  declineChallenge: (challengeId: string) => void;
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
    } catch {}
  }

  useEffect(() => {
    let mounted = true;
    async function loadChallengesFromApi() {
      if (!user?.id) return;
      try {
        const feedItems = await feedService.getMyFeed();
        const mappedChallenges: Challenge[] = (feedItems || [])
          .filter(it => it.feedItemType === 'CHALLENGE')
          .map((it) => mapFeedItemToChallenge(it, user?.id));
        if (!mounted) return;
        setChallenges(mappedChallenges);
        persistChallenges(mappedChallenges);
      } catch (e) {
        // ignore
      }
    }

    loadChallengesFromApi();
    return () => { mounted = false; };
  }, [user?.id]);

  function persistChallenges(data: Challenge[]) {
    AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(data));
  }

  function mapFeedItemToChallenge(item: FeedItemResponse | any, currentUserId?: string | number | null): Challenge {
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

    const challenger = content.challenger || content.challengerResponse || content.challengerUser;
    const challenged = content.challenged || content.challengedResponse || content.challengedUser;
    const proof = content.proof || content.proofResponse;
    const challengerRaw = safeUser(challenger, content.challengerId ?? '');
    const challengedRaw = safeUser(challenged, content.challengedId ?? '');

    return {
        id: content.id,
        challenger: challengerRaw,
        challenged: challengedRaw,
        title: content.title,
        description: content.description,
        amount: content.amount,
        proof: mapProof(proof),
        createdAt: content.createdAt,
        closedAt: content.closedAt,
        deadline: content.deadline,
        status: content.status,
        group: content.group
    } as Challenge;
  }

  const voteChallenge = useCallback((challengeId: string, approved: boolean) => {
    console.log('vote challenge not implemented');
  }, []);

    const acceptChallenge = useCallback(async (challengeId: string) => {
        try {
            await challengeService.acceptChallenge(challengeId);
            setChallenges((prev) => {
                const updated = prev.map((challenge) => (challenge.id.toString() === challengeId ? { ...challenge, status: 'IN_PROGRESS' as const } : challenge));
                persistChallenges(updated);
                return updated;
            });
        } catch (e) {
        }
    }, []);

    const declineChallenge = useCallback(async (challengeId: string) => {
        try {
            await challengeService.declineChallenge(challengeId);
            setChallenges((prev) => {
                const updated = prev.filter((challenge) => challenge.id.toString() !== challengeId);
                persistChallenges(updated);
                return updated;
            });
        } catch (e) {
        }
    }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
        if (!user?.id) return;
        const feedItems = await feedService.getMyFeed();
        const mappedChallenges: Challenge[] = (feedItems || [])
            .filter(it => it.feedItemType === 'CHALLENGE')
            .map((it) => mapFeedItemToChallenge(it, user?.id));
        setChallenges(mappedChallenges);
        persistChallenges(mappedChallenges);
    } catch (e) {
      // ignore
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
