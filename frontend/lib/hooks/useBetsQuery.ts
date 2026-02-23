import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { betsService } from '@/lib/api';
import { CreateBetRequest, VoteRequest, Bet } from '@/lib/types';

export const FEED_QUERY_KEY = ['bets', 'feed'];
export const MY_BETS_QUERY_KEY = ['bets', 'mine'];

export function useFeedBets() {
  return useQuery<Bet[]>({
    queryKey: FEED_QUERY_KEY,
    queryFn: async () => {
      const response = await betsService.getFeed();
      return response.content;
    },
    staleTime: 30 * 1000,
  });
}

export function useMyBets() {
  return useQuery<Bet[]>({
    queryKey: MY_BETS_QUERY_KEY,
    queryFn: async () => {
      const response = await betsService.getMyBets();
      return response.content;
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBetRequest) => betsService.createBet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_BETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useAcceptBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (betId: string) => betsService.acceptBet(betId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_BETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useDeclineBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (betId: string) => betsService.declineBet(betId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_BETS_QUERY_KEY });
    },
  });
}

export function useVoteBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoteRequest) => betsService.vote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}
