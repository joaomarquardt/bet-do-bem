import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bet, CreateBetRequest } from '@/lib/types';
import { feedService } from '@/lib/api/feed.service';
import { betsService } from '@/lib/api/bets.service';
import { mapFeedItemToBet } from '@/lib/utils/feedItemMappers';
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
  wallet: WalletLike;
  isLoading: boolean;
  voteBet: (betId: string, votedForUserId: string) => void;
  acceptBet: (betId: string) => Promise<void>;
  declineBet: (betId: string) => Promise<void>;
  createBet: (request: CreateBetRequest) => Promise<void>;
  refreshData: () => void;
}

const BetsContext = createContext<BetsContextValue | null>(null);

const STORAGE_KEYS = {
  FEED: '@betdobem_feed',
  WALLET: '@betdobem_wallet',
} as const;

export function BetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [feedBets, setFeedBets] = useState<Bet[]>([]);
  const [wallet, setWallet] = useState<WalletLike>({ balance: 0, transactions: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPersistedData();
  }, []);

  async function loadPersistedData() {
    try {
      const [feedData, walletData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.FEED),
        AsyncStorage.getItem(STORAGE_KEYS.WALLET),
      ]);
      if (feedData) setFeedBets(JSON.parse(feedData));
      if (walletData) setWallet(JSON.parse(walletData));
    } catch (e) {
      console.error('BetsProvider: failed to load persisted data', e);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadFeedFromApi() {
      if (!user?.id) return;
      try {
        const feedItems = await feedService.getMyFeed();
        const mappedFeedBets: Bet[] = (feedItems || [])
          .filter((it) => it.feedItemType === 'BET')
          .map((it) => mapFeedItemToBet(it));
        if (!mounted) return;
        setFeedBets(mappedFeedBets);
        persistFeed(mappedFeedBets);
      } catch (e) {
        console.error('BetsProvider: failed to load feed from API', e);
      }
    }

    loadFeedFromApi();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  function persistFeed(data: Bet[]) {
    AsyncStorage.setItem(STORAGE_KEYS.FEED, JSON.stringify(data));
  }
  function persistWallet(data: WalletLike) {
    AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(data));
  }

  const voteBet = useCallback(
    (betId: string, votedForUserId: string) => {
      setFeedBets((prev) => prev);
    },
    [],
  );

  const acceptBet = useCallback(async (betId: string) => {
    await betsService.acceptBet(betId);
  }, []);

  const declineBet = useCallback(async (betId: string) => {
    await betsService.declineBet(betId);
  }, []);

  const refreshData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const feedItems = await feedService.getMyFeed();
      const mappedFeedBets: Bet[] = (feedItems || [])
        .filter((it) => it.feedItemType === 'BET')
        .map((it) => mapFeedItemToBet(it));

      setFeedBets(mappedFeedBets);
      persistFeed(mappedFeedBets);
    } catch (e) {
      console.error('BetsProvider: failed to refresh feed', e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createBet = useCallback(
    async (request: CreateBetRequest) => {
      try {
        await betsService.createBet(request);
        await refreshData();
      } catch (e) {
        console.error('Erro ao criar aposta', e);
        throw e;
      }
    },
    [refreshData],
  );

  const value = useMemo(
    () => ({ feedBets, wallet, isLoading, voteBet, acceptBet, declineBet, createBet, refreshData }),
    [feedBets, wallet, isLoading, voteBet, acceptBet, declineBet, createBet, refreshData],
  );

  return <BetsContext.Provider value={value}>{children}</BetsContext.Provider>;
}

export function useBets() {
  const context = useContext(BetsContext);
  if (!context) throw new Error('useBets must be used within a BetsProvider');
  return context;
}
