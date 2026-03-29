import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { groupService } from '@/lib/api/group.service';
import { Group } from '@/lib/types';

interface GroupContextValue {
  groups: Group[];
  activeGroup: Group | null;
  isLoading: boolean;
  error: string | null;
  selectGroup: (groupId: number) => void;
  refreshGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await groupService.getAllGroups();
      setGroups(data);

      if (data.length > 0 && !activeGroupId) {
        setActiveGroupId(data[0].id);
      }
    } catch (err: any) {
      console.error('Erro ao carregar grupos:', err);
      setError(err?.message ?? 'Erro ao carregar grupos');
    } finally {
      setIsLoading(false);
    }
  }, [activeGroupId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const selectGroup = useCallback((groupId: number) => {
    setActiveGroupId(groupId);
  }, []);

  const refreshGroups = useCallback(async () => {
    await loadGroups();
  }, [loadGroups]);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  const value = useMemo(
    () => ({
      groups,
      activeGroup,
      isLoading,
      error,
      selectGroup,
      refreshGroups,
    }),
    [groups, activeGroup, isLoading, error, selectGroup, refreshGroups],
  );

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}

