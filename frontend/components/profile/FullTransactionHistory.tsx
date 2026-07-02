import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, Modal, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { TransactionItem, type ProfileTransaction } from './TransactionItem';
import { userService } from '@/lib/api/user.service';
import type { TransactionType } from '@/lib/types';

const c = Colors.dark;

interface FullTransactionHistoryProps {
  visible: boolean;
  onClose: () => void;
  initialTransactions: ProfileTransaction[];
  totalElements: number;
}

function mapApiTransactionsToDomain(apiTxs: any[]): ProfileTransaction[] {
  return apiTxs.map((t: any) => {
    const apiType = (t.transactionType as TransactionType) || 'BET_ENTRY';
    const contextType = t.contextType || 'UNKNOWN';
    const description =
      contextType === 'BET'
        ? `Aposta #${t.contextId}`
        : contextType === 'CHALLENGE'
        ? `Desafio #${t.contextId}`
        : contextType === 'ACTIVITY'
        ? `Atividade #${t.contextId}`
        : `${contextType} #${t.contextId}`;

    return {
      id: String(t.id),
      type: apiType as TransactionType,
      amount: Number(t.amount),
      description,
      betId: t.contextId ? String(t.contextId) : undefined,
      createdAt: t.createdAt,
    };
  });
}

export function FullTransactionHistory({
  visible,
  onClose,
  initialTransactions,
  totalElements,
}: FullTransactionHistoryProps) {
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<ProfileTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (visible) {
      initialLoadDone.current = false;
      setTransactions(initialTransactions);
      setCurrentPage(0);
      setHasMore(initialTransactions.length < totalElements);

      const loadSecondBatch = async () => {
        try {
          const pagedResult = await userService.getMyTransactions({ page: 1, size: 5 });
          const mapped = mapApiTransactionsToDomain(pagedResult.content);
          setTransactions((prev) => [...prev, ...mapped]);
          setCurrentPage(1);
          setHasMore(pagedResult.hasNext);
        } catch (err) {
          console.error('Erro ao carregar segunda página de transações', err);
        } finally {
          initialLoadDone.current = true;
        }
      };

      if (initialTransactions.length > 0 && initialTransactions.length < totalElements) {
        loadSecondBatch();
      } else {
        initialLoadDone.current = true;
        setHasMore(false);
      }
    }
  }, [visible, initialTransactions, totalElements]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !initialLoadDone.current) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const pagedResult = await userService.getMyTransactions({ page: nextPage, size: 10 });
      const mapped = mapApiTransactionsToDomain(pagedResult.content);
      setTransactions((prev) => [...prev, ...mapped]);
      setCurrentPage(nextPage);
      setHasMore(pagedResult.hasNext);
    } catch (err) {
      console.error('Erro ao carregar mais transações', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, currentPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: ProfileTransaction; index: number }) => (
      <TransactionItem transaction={item} index={index} />
    ),
    [],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={modalStyles.footer}>
        <ActivityIndicator size="small" color={c.accent} />
        <Text style={[modalStyles.footerText, { color: c.textTertiary }]}>Carregando...</Text>
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(
    () => (
      <View style={modalStyles.empty}>
        <Ionicons name="receipt-outline" size={40} color={c.textTertiary} />
        <Text style={[modalStyles.emptyText, { color: c.textTertiary }]}>
          Nenhuma transação encontrada
        </Text>
      </View>
    ),
    [],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[modalStyles.container, { backgroundColor: c.background }]}>
        <View
          style={[
            modalStyles.header,
            {
              backgroundColor: c.surface,
              borderBottomColor: c.border,
              paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 16,
            },
          ]}
        >
          <Text style={[modalStyles.headerTitle, { color: c.text }]}>Extrato Completo</Text>
          <Text style={[modalStyles.headerSubtitle, { color: c.textTertiary }]}>
            {totalElements} transações
          </Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              modalStyles.closeButton,
              { backgroundColor: c.surfaceElevated, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="close" size={20} color={c.text} />
          </Pressable>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 20,
            flexGrow: transactions.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: c.background }}
        />
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
});
