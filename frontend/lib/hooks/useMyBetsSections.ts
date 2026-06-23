import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { feedService } from '@/lib/api/feed.service';
import { useAuth } from '@/lib/contexts';
import {
  BetsTabItem,
  mapFeedItemsToBetsTabItems,
} from '@/lib/utils/feedItemMappers';

export type BetsTabSectionKey =
  | 'pendingInvites'
  | 'awaitingAcceptance'
  | 'inProgress';

export type BetsTabSection = {
  title: string;
  key: BetsTabSectionKey;
  data: BetsTabItem[];
};

export const MY_BETS_SECTIONS_QUERY_KEY = ['my-bets-sections'] as const;

export const myBetsSectionQueryKeys = {
  all: MY_BETS_SECTIONS_QUERY_KEY,
  pending: [...MY_BETS_SECTIONS_QUERY_KEY, 'pending'] as const,
  waiting: [...MY_BETS_SECTIONS_QUERY_KEY, 'waiting'] as const,
  inProgress: [...MY_BETS_SECTIONS_QUERY_KEY, 'in-progress'] as const,
};

const SECTION_CONFIG: {
  key: BetsTabSectionKey;
  title: string;
  queryKey: readonly string[];
  fetcher: () => ReturnType<typeof feedService.getMyPendingInvites>;
}[] = [
  {
    key: 'pendingInvites',
    title: 'Convites Pendentes',
    queryKey: myBetsSectionQueryKeys.pending,
    fetcher: () => feedService.getMyPendingInvites(),
  },
  {
    key: 'awaitingAcceptance',
    title: 'Aguardando Aceite',
    queryKey: myBetsSectionQueryKeys.waiting,
    fetcher: () => feedService.getMyWaitingOpponentAcceptanceItems(),
  },
  {
    key: 'inProgress',
    title: 'Em Andamento',
    queryKey: myBetsSectionQueryKeys.inProgress,
    fetcher: () => feedService.getMyInProgressItems(),
  },
];

export function useMyBetsSections() {
  const { user } = useAuth();
  const enabled = !!user?.id;

  const results = useQueries({
    queries: SECTION_CONFIG.map((section) => ({
      queryKey: section.queryKey,
      queryFn: section.fetcher,
      enabled,
    })),
  });

  const sections = useMemo<BetsTabSection[]>(() => {
    return SECTION_CONFIG.flatMap((section, index) => {
      const data = mapFeedItemsToBetsTabItems(results[index]?.data ?? []);
      if (data.length === 0) return [];
      return [{ title: section.title, key: section.key, data }];
    });
  }, [results[0]?.data, results[1]?.data, results[2]?.data]);

  const isLoading =
    enabled && results.some((result) => result.isLoading && !result.data);
  const isRefetching = results.some((result) => result.isRefetching);

  const refetch = async () => {
    await Promise.all(results.map((result) => result.refetch()));
  };

  return { sections, isLoading, isRefetching, refetch };
}
