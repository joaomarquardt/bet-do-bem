import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { MOCK_FEED_BETS, MOCK_MY_BETS, MOCK_WALLET, MOCK_CURRENT_USER } from '@/lib/mocks/data';
import { Bet, Wallet } from '@/lib/types';

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
  const [feedBets, setFeedBets] = useState<Bet[]>(MOCK_FEED_BETS);
  const [myBets, setMyBets] = useState<Bet[]>(MOCK_MY_BETS);
  const [wallet, setWallet] = useState<Wallet>(MOCK_WALLET);
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

  function persistFeed(data: Bet[]) {
    AsyncStorage.setItem(STORAGE_KEYS.FEED, JSON.stringify(data));
  }
  function persistBets(data: Bet[]) {
    AsyncStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(data));
  }
  function persistWallet(data: Wallet) {
    AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(data));
  }

  // TODO: Replace with betsService.vote() when connecting to real API
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

  // TODO: Replace with betsService.acceptBet() when connecting to real API
  const acceptBet = useCallback((betId: string) => {
    setMyBets((prev) => {
      const updated = prev.map((bet) =>
        bet.id === betId ? { ...bet, status: 'IN_PROGRESS' as const } : bet,
      );
      persistBets(updated);
      return updated;
    });
    setWallet((prev) => {
      const bet = myBets.find((b) => b.id === betId);
      if (!bet) return prev;
      const updated: Wallet = {
        ...prev,
        balance: prev.balance - bet.buyIn,
        transactions: [
          {
            id: Crypto.randomUUID(),
            type: 'BET_ENTRY',
            amount: -bet.buyIn,
            description: `Entrada - ${bet.title}`,
            betId,
            createdAt: new Date().toISOString(),
          },
          ...prev.transactions,
        ],
      };
      persistWallet(updated);
      return updated;
    });
  }, [myBets]);

  // TODO: Replace with betsService.declineBet() when connecting to real API
  const declineBet = useCallback((betId: string) => {
    setMyBets((prev) => {
      const updated = prev.filter((bet) => bet.id !== betId);
      persistBets(updated);
      return updated;
    });
  }, []);

  // TODO: Replace with betsService.createBet() when connecting to real API
  const createBet = useCallback((title: string, description: string, buyIn: number, opponentUsername: string) => {
    const newBet: Bet = {
      id: Crypto.randomUUID(),
      title,
      description,
      buyIn,
      status: 'PENDING',
      creatorId: 'me',
      creator: MOCK_CURRENT_USER,
      opponentId: 'opponent-new',
      opponent: {
        id: 'opponent-new',
        username: opponentUsername,
        displayName: opponentUsername,
        avatarColor: '#45B7D1',
        wins: 0, losses: 0, draws: 0,
      },
      comments: [],
      votes: { creatorVotes: 0, opponentVotes: 0 },
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    setMyBets((prev) => {
      const updated = [newBet, ...prev];
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
            betId: newBet.id,
            createdAt: new Date().toISOString(),
          },
          ...prev.transactions,
        ],
      };
      persistWallet(updated);
      return updated;
    });
  }, []);

  const refreshData = useCallback(() => {
    // TODO: Replace with API calls:
    // queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    // queryClient.invalidateQueries({ queryKey: MY_BETS_QUERY_KEY });
    // queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEY });
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
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
