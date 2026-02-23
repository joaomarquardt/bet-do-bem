import { useQuery } from '@tanstack/react-query';
import { walletService } from '@/lib/api';
import { Wallet } from '@/lib/types';

export const WALLET_QUERY_KEY = ['wallet'];

export function useWallet() {
  return useQuery<Wallet>({
    queryKey: WALLET_QUERY_KEY,
    queryFn: () => walletService.getWallet(),
    staleTime: 30 * 1000,
  });
}
