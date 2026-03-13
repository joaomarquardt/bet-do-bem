import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { TransactionItem, type ProfileTransaction } from '@/components/profile/TransactionItem';
import { useAuth } from '@/lib/contexts';
import { userService } from '@/lib/api/user.service';
import type { TransactionType } from '@/lib/types';
import { styles } from '@/styles/tabs/profile.styles';

const c = Colors.dark;

type Wallet = {
  balance: number;
  transactions: ProfileTransaction[];
};

function stringToColor(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h},60%,50%)`;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const authUser: any = user;
  const displayName = authUser?.displayName ?? authUser?.name ?? authUser?.email ?? 'Usuário';
  const username = authUser?.name ?? (typeof authUser?.email === 'string' ? authUser.email.split('@')[0] : `user${authUser?.id ?? ''}`);
  const avatarColor = authUser?.avatarColor ?? stringToColor(displayName);
  const wins: number | undefined = typeof authUser?.wins === 'number' ? authUser.wins : undefined;
  const losses: number | undefined = typeof authUser?.losses === 'number' ? authUser.losses : undefined;
  const draws: number | undefined = typeof authUser?.draws === 'number' ? authUser.draws : undefined;
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<ProfileTransaction[] | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 84 : insets.bottom + 90;

  const handleLogout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
  }, [logout]);

  if (!user) return null;

  const mapApiTransactionsToDomain = (apiTxs: any[]): ProfileTransaction[] => {
    return apiTxs.map((t: any) => {
      const apiType = (t.transactionType as TransactionType) || 'BET_ENTRY';
      const mappedType = apiType as TransactionType;

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
        type: mappedType,
        amount: Number(t.amount),
        description,
        betId: t.contextId ? String(t.contextId) : undefined,
        createdAt: t.createdAt,
      };
    });
  };

  const loadProfileAndTransactions = useCallback(async () => {
    setIsLoadingWallet(true);
    setWalletError(null);
    setIsLoadingTransactions(true);
    setTransactionsError(null);

    try {
      const profile = await userService.getMyProfile();
      setWallet({ balance: profile.coins ?? 0, transactions: [] });

      try {
        const apiTxs = await userService.getMyTransactions();
        const mapped = mapApiTransactionsToDomain(apiTxs);
        setTransactions(mapped);
        setWallet((prev) =>
          prev
            ? { ...prev, transactions: mapped }
            : { balance: profile.coins ?? 0, transactions: mapped },
        );
      } catch (txErr: any) {
        setTransactions(null);
        setTransactionsError(txErr?.message || 'Erro ao carregar transacoes');
      }
    } catch (err: any) {
      setWallet(null);
      setWalletError(err?.message || 'Erro ao carregar carteira');
      setTransactions(null);
      setTransactionsError(err?.message || 'Erro ao carregar transacoes');
    } finally {
      setIsLoadingWallet(false);
      setIsLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      loadProfileAndTransactions();
    }

    return () => {
      mounted = false;
    };
  }, [loadProfileAndTransactions]);

  const totalGames = (typeof wins === 'number' && typeof losses === 'number' && typeof draws === 'number') ? wins + losses + draws : 0;
  const winRate = totalGames > 0 && typeof wins === 'number' ? Math.round((wins / totalGames) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPadding + 20 }]}>
        <Avatar name={displayName} color={avatarColor} size={72} />
        <Text style={[styles.displayName, { color: c.text }]}>{displayName}</Text>
        <Text style={[styles.username, { color: c.textSecondary }]}>{username ? `@${username}` : ''}</Text>
      </View>

      {typeof wins === 'number' && typeof losses === 'number' && typeof draws === 'number' ? (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: c.winDim }]}>
            <Ionicons name="trophy" size={20} color={c.win} />
            <Text style={[styles.statValue, { color: c.win }]}>{wins}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>Vitorias</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.lossDim }]}>
            <Ionicons name="close-circle" size={20} color={c.loss} />
            <Text style={[styles.statValue, { color: c.loss }]}>{losses}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>Derrotas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.drawDim }]}>
            <Ionicons name="swap-horizontal" size={20} color={c.draw} />
            <Text style={[styles.statValue, { color: c.draw }]}>{draws}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>Empates</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.accentDim }]}>
            <Ionicons name="analytics" size={20} color={c.accent} />
            <Text style={[styles.statValue, { color: c.accent }]}>{winRate}%</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>Win Rate</Text>
          </View>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.walletCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.walletHeader}>
          <View>
            <Text style={[styles.walletLabel, { color: c.textSecondary }]}>Saldo da Carteira</Text>
            <View style={styles.balanceRow}>
              <MaterialCommunityIcons name="currency-usd" size={28} color={c.accent} />
              <Text style={[styles.balanceValue, { color: c.text }]}>
                {isLoadingWallet ? 'Carregando...' : wallet ? wallet.balance.toLocaleString() : '—'}
              </Text>
            </View>
          </View>
          <View style={[styles.walletIcon, { backgroundColor: c.accentDim }]}>
            <Ionicons name="wallet" size={24} color={c.accent} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Extrato</Text>
          <Text style={[styles.sectionCount, { color: c.textTertiary }]}>{transactions ? transactions.length : 0} transacoes</Text>
        </View>
        <View style={[styles.transactionsCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          {isLoadingTransactions ? (
            <View style={styles.transactionsEmpty}>
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>Carregando extrato...</Text>
            </View>
          ) : transactionsError ? (
            <View style={styles.transactionsEmpty}>
              <Ionicons name="alert-circle-outline" size={32} color={c.textTertiary} />
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>{transactionsError}</Text>
              <Pressable
                onPress={() => {
                  loadProfileAndTransactions();
                }}
                style={{ marginTop: 8 }}
              >
                <Text style={[styles.emptyText, { color: c.accent }]}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : !transactions || transactions.length === 0 ? (
            <View style={styles.transactionsEmpty}>
              <Ionicons name="receipt-outline" size={32} color={c.textTertiary} />
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>Nenhuma transacao ainda</Text>
            </View>
          ) : (
            transactions.map((tx, index) => (
              <TransactionItem key={tx.id} transaction={tx} index={index} />
            ))
          )}
        </View>
      </Animated.View>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, { borderColor: c.danger, opacity: pressed ? 0.7 : 1 }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color={c.danger} />
        <Text style={[styles.logoutText, { color: c.danger }]}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}
