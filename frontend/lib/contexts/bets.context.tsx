import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Bet, Wallet, FeedItemResponse } from '@/lib/types';
import { feedService } from '@/lib/api/feed.service';
import { betsService } from '@/lib/api/bets.service';
import { useAuth } from '@/lib/contexts';

interface BetsContextValue {
  feedBets: Bet[];
  myBets: Bet[];
  wallet: Wallet;
  isLoading: boolean;
  voteBet: (betId: string, votedForUserId: string) => void;
  acceptBet: (betId: string) => void;
  declineBet: (betId: string) => void;
  createBet: (title: string, description: string, buyIn: number, opponentUsername: string) => void;
  refreshData: () => void;
}

const BetsContext = createContext<BetsContextValue | null>(null);

const STORAGE_KEYS = {
  FEED: '@betdobem_feed',
  BETS: '@betdobem_bets',
  WALLET: '@betdobem_wallet',
} as const;

export function BetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [feedBets, setFeedBets] = useState<Bet[]>([]);
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ balance: 0, transactions: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPersistedData();
  }, []);

  async function loadPersistedData() {
    try {
      const [feedData, betsData, walletData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.FEED),
        AsyncStorage.getItem(STORAGE_KEYS.BETS),
        AsyncStorage.getItem(STORAGE_KEYS.WALLET),
      ]);
      if (feedData) setFeedBets(JSON.parse(feedData));
      if (betsData) setMyBets(JSON.parse(betsData));
      if (walletData) setWallet(JSON.parse(walletData));
    } catch {}
  }

  useEffect(() => {
    let mounted = true;
    async function loadMyBetsFromApi() {
      try {
        const [pending, inProgress] = await Promise.all([
          feedService.getMyPendingInvites(),
          feedService.getMyInProgressItems(),
        ]);

        const mapped: Bet[] = [...pending, ...inProgress].map((it) => mapFeedItemToBet(it, user?.id));
        if (!mounted) return;
        setMyBets(mapped);
        persistBets(mapped);
      } catch (e) {
      }
    }

    loadMyBetsFromApi();
    return () => { mounted = false; };
  }, [user?.id]);

  function persistFeed(data: Bet[]) {
    AsyncStorage.setItem(STORAGE_KEYS.FEED, JSON.stringify(data));
  }
  function persistBets(data: Bet[]) {
    AsyncStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(data));
  }
  function persistWallet(data: Wallet) {
    AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(data));
  }

  function mapFeedItemToBet(item: FeedItemResponse | any, currentUserId?: string | number | null): Bet {
    const content = item.content || item;
    const creator = content.creator || content.creatorResponse || content.creatorUser || { id: String(content.creatorId || ''), username: content.creatorUsername || '', displayName: content.creatorDisplayName || '', avatarColor: '#CCCCCC', wins: 0, losses: 0, draws: 0 };
    const opponent = content.opponent || content.opponentResponse || { id: String(content.opponentId || ''), username: content.opponentUsername || '', displayName: content.opponentDisplayName || '', avatarColor: '#CCCCCC', wins: 0, losses: 0, draws: 0 };
    const proofs = content.proofs || content.proofsList || [];
    let status = String(content.status ?? content.betStatus ?? 'INVITED');

    const creatorIdRaw = String(creator.id ?? '');
    const opponentIdRaw = String(opponent.id ?? '');
    const creatorId = currentUserId && String(currentUserId) === creatorIdRaw ? 'me' : creatorIdRaw;
    const opponentId = currentUserId && String(currentUserId) === opponentIdRaw ? 'me' : opponentIdRaw;

    return {
      id: String(content.id ?? item.id ?? ''),
      title: content.title ?? content.name ?? '',
      description: content.description ?? '',
      buyIn: Number(content.buyIn ?? content.buy_in ?? 0),
      status: (status as any),
      creatorId,
      opponentId,
      creator: {
        id: String(creator.id ?? ''),
        username: creator.username ?? creator.displayName ?? 'user',
        displayName: creator.displayName ?? creator.username ?? 'User',
        avatarColor: creator.avatarColor ?? '#CCCCCC',
        wins: creator.wins ?? 0,
        losses: creator.losses ?? 0,
        draws: creator.draws ?? 0,
      },
      opponent: {
        id: String(opponent.id ?? ''),
        username: opponent.username ?? opponent.displayName ?? 'opponent',
        displayName: opponent.displayName ?? opponent.username ?? 'Opponent',
        avatarColor: opponent.avatarColor ?? '#CCCCCC',
        wins: opponent.wins ?? 0,
        losses: opponent.losses ?? 0,
        draws: opponent.draws ?? 0,
      },
      comments: [],
      votes: { creatorVotes: 0, opponentVotes: 0 },
      deadline: content.expiresAt ? new Date(content.expiresAt).toISOString() : content.deadline ? new Date(content.deadline).toISOString() : new Date().toISOString(),
      createdAt: content.createdAt ? new Date(content.createdAt).toISOString() : new Date().toISOString(),
    } as Bet;
  }

  const voteBet = useCallback((betId: string, votedForUserId: string) => {
    setFeedBets((prev) => {
      const updated = prev.map((bet) => {
        if (bet.id !== betId) return bet;
        const isCreator = votedForUserId === bet.creatorId;
        return {
          ...bet,
          myVote: votedForUserId,
          votes: {
            creatorVotes: bet.votes.creatorVotes + (isCreator ? 1 : 0),
            opponentVotes: bet.votes.opponentVotes + (!isCreator ? 1 : 0),
          },
        };
      });
      persistFeed(updated);
      return updated;
    });
  }, []);

  const acceptBet = useCallback(async (betId: string) => {
    try {
      await betsService.acceptBet(betId);
      setMyBets((prev) => {
        const updated = prev.map((bet) => (bet.id === betId ? { ...bet, status: 'IN_PROGRESS' as const } : bet));
        persistBets(updated);
        return updated;
      });
    } catch (e) {
    }
  }, []);

  const declineBet = useCallback(async (betId: string) => {
    try {
      await betsService.declineBet(betId);
      setMyBets((prev) => {
        const updated = prev.filter((bet) => bet.id !== betId);
        persistBets(updated);
        return updated;
      });
    } catch (e) {
    }
  }, []);

  const createBet = useCallback(async (title: string, description: string, buyIn: number, opponentUsername: string) => {
    try {
      const created = await betsService.createBet({ title, description, buyIn, opponentUsername });
      const mapped = mapFeedItemToBet({ content: created, id: created.id });
      setMyBets((prev) => {
        const updated = [mapped, ...prev];
        persistBets(updated);
        return updated;
      });
      setWallet((prev) => {
        const updated: Wallet = {
          ...prev,
          balance: prev.balance - buyIn,
          transactions: [
            {
              id: Crypto.randomUUID(),
              type: 'BET_ENTRY',
              amount: -buyIn,
              description: `Entrada - ${title}`,
              betId: String(created.id),
              createdAt: new Date().toISOString(),
            },
            ...prev.transactions,
          ],
        };
        persistWallet(updated);
        return updated;
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pending, inProgress] = await Promise.all([
        feedService.getMyPendingInvites(),
        feedService.getMyInProgressItems(),
      ]);
      const mapped: Bet[] = [...pending, ...inProgress].map(mapFeedItemToBet);
      setMyBets(mapped);
      persistBets(mapped);
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ feedBets, myBets, wallet, isLoading, voteBet, acceptBet, declineBet, createBet, refreshData }),
    [feedBets, myBets, wallet, isLoading, voteBet, acceptBet, declineBet, createBet, refreshData],
  );

  return <BetsContext.Provider value={value}>{children}</BetsContext.Provider>;
}

export function useBets() {
  const context = useContext(BetsContext);
  if (!context) throw new Error('useBets must be used within a BetsProvider');
  return context;
}
