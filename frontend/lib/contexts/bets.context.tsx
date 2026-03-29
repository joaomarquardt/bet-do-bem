import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Bet, FeedItemResponse } from '@/lib/types';
import { feedService } from '@/lib/api/feed.service';
import { betsService } from '@/lib/api/bets.service';
import { useAuth } from '@/lib/contexts';

type WalletLike = {
  balance: number;
  transactions: {
    id: string;
    type: string;
    amount: number;
    description: string;
    betId?: string;
    createdAt: string;
  }[];
};

interface BetsContextValue {
  feedBets: Bet[];
  myBets: Bet[];
  wallet: WalletLike;
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
  const [wallet, setWallet] = useState<WalletLike>({ balance: 0, transactions: [] });
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

    async function loadFeedFromApi() {
      if (!user?.id) return;
      try {
        const feedItems = await feedService.getMyFeed();
        const mappedFeedBets: Bet[] = (feedItems || [])
          .filter((it) => it.feedItemType === 'BET')
          .map((it) => mapFeedItemToBet(it, user.id));
        if (!mounted) return;
        setFeedBets(mappedFeedBets);
        persistFeed(mappedFeedBets);
      } catch (e) {
        // ignore for now; feed will stay with cached data
      }
    }

    loadFeedFromApi();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;
    async function loadMyBetsFromApi() {
      if (!user?.id) return;
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
  function persistWallet(data: WalletLike) {
    AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(data));
  }

  function mapFeedItemToBet(item: FeedItemResponse | any, currentUserId?: string | number | null): Bet {
    const content = item.content || item;
    const creator = content.creator || content.creatorResponse || content.creatorUser || { id: String(content.creatorId || ''), username: content.creatorUsername || '', displayName: content.creatorDisplayName || '', avatarColor: '#CCCCCC', wins: 0, losses: 0, draws: 0 };
    const opponent = content.opponent || content.opponentResponse || { id: String(content.opponentId || ''), username: content.opponentUsername || '', displayName: content.opponentDisplayName || '', avatarColor: '#CCCCCC', wins: 0, losses: 0, draws: 0 };
    const proofs = content.proofs || content.proofsList || [];
    let status = String(content.status ?? content.betStatus ?? 'INVITED');

    return {
      id: Number(content.id ?? item.id ?? 0),
      title: content.title ?? content.name ?? '',
      description: content.description ?? '',
      proofs,
      buyIn: Number(content.buyIn ?? content.buy_in ?? 0),
      createdAt: content.createdAt
        ? new Date(content.createdAt).toISOString()
        : new Date().toISOString(),
      closedAt: content.closedAt ?? content.expiresAt ?? new Date().toISOString(),
      expiresAt: content.expiresAt ?? content.deadline ?? new Date().toISOString(),
      status: status as any,
      creator: {
        id: Number(creator.id ?? 0),
        name: creator.name ?? creator.displayName ?? creator.username ?? 'User',
        email: creator.email ?? '',
        username: creator.username ?? creator.name ?? creator.displayName ?? 'user',
        displayName: creator.displayName ?? creator.name ?? creator.username ?? 'User',
        role: creator.role ?? 'USER',
        coins: Number(creator.coins ?? 0),
        avatarColor: creator.avatarColor ?? '#CCCCCC',
        wins: creator.wins ?? 0,
        losses: creator.losses ?? 0,
        draws: creator.draws ?? 0,
      },
      opponent: {
        id: Number(opponent.id ?? 0),
        name: opponent.name ?? opponent.displayName ?? opponent.username ?? 'Opponent',
        email: opponent.email ?? '',
        username: opponent.username ?? opponent.name ?? opponent.displayName ?? 'opponent',
        displayName: opponent.displayName ?? opponent.name ?? opponent.username ?? 'Opponent',
        role: opponent.role ?? 'USER',
        coins: Number(opponent.coins ?? 0),
        avatarColor: opponent.avatarColor ?? '#CCCCCC',
        wins: opponent.wins ?? 0,
        losses: opponent.losses ?? 0,
        draws: opponent.draws ?? 0,
      },
      group: content.group,
    } as Bet;
  }

  const voteBet = useCallback(
    (betId: string, votedForUserId: string) => {
      setFeedBets((prev) => prev);
    },
    [],
  );

  const acceptBet = useCallback(async (betId: string) => {
    try {
      await betsService.acceptBet(betId);
      setMyBets((prev) => {
        const updated = prev.map((bet) => (bet.id === Number(betId) ? { ...bet, status: 'IN_PROGRESS' as const } : bet));
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
        const updated = prev.filter((bet) => bet.id !== Number(betId));
        persistBets(updated);
        return updated;
      });
    } catch (e) {
    }
  }, []);

  const createBet = useCallback(async (title: string, description: string, buyIn: number, opponentUsername: string) => {
    try {
      const created = await betsService.createBet({ title, description, buyIn, opponentUsername } as any);
      const mapped = mapFeedItemToBet({ content: created, id: created.id });
      setMyBets((prev) => {
        const updated = [mapped, ...prev];
        persistBets(updated);
        return updated;
      });
      setWallet((prev) => {
        const updated: WalletLike = {
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
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [pending, inProgress, feedItems] = await Promise.all([
        feedService.getMyPendingInvites(),
        feedService.getMyInProgressItems(),
        feedService.getMyFeed(),
      ]);
      const mappedMyBets: Bet[] = [...pending, ...inProgress].map((it) =>
        mapFeedItemToBet(it, user.id),
      );
      const mappedFeedBets: Bet[] = (feedItems || [])
        .filter((it) => it.feedItemType === 'BET')
        .map((it) => mapFeedItemToBet(it, user.id));

      setMyBets(mappedMyBets);
      persistBets(mappedMyBets);

      setFeedBets(mappedFeedBets);
      persistFeed(mappedFeedBets);
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
