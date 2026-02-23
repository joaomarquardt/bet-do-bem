import { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { TransactionItem } from '@/components/profile/TransactionItem';
import { useAuth, useBets } from '@/lib/contexts';
import { styles } from '@/styles/tabs/profile.styles';

const c = Colors.dark;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { wallet } = useBets();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 84 : insets.bottom + 90;

  const handleLogout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
  }, [logout]);

  if (!user) return null;

  const totalGames = user.wins + user.losses + user.draws;
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPadding + 20 }]}>
        <Avatar name={user.displayName} color={user.avatarColor} size={72} />
        <Text style={[styles.displayName, { color: c.text }]}>{user.displayName}</Text>
        <Text style={[styles.username, { color: c.textSecondary }]}>@{user.username}</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: c.winDim }]}>
          <Ionicons name="trophy" size={20} color={c.win} />
          <Text style={[styles.statValue, { color: c.win }]}>{user.wins}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>Vitorias</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: c.lossDim }]}>
          <Ionicons name="close-circle" size={20} color={c.loss} />
          <Text style={[styles.statValue, { color: c.loss }]}>{user.losses}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>Derrotas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: c.drawDim }]}>
          <Ionicons name="swap-horizontal" size={20} color={c.draw} />
          <Text style={[styles.statValue, { color: c.draw }]}>{user.draws}</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>Empates</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: c.accentDim }]}>
          <Ionicons name="analytics" size={20} color={c.accent} />
          <Text style={[styles.statValue, { color: c.accent }]}>{winRate}%</Text>
          <Text style={[styles.statLabel, { color: c.textSecondary }]}>Win Rate</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.walletCard, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={styles.walletHeader}>
          <View>
            <Text style={[styles.walletLabel, { color: c.textSecondary }]}>Saldo da Carteira</Text>
            <View style={styles.balanceRow}>
              <MaterialCommunityIcons name="currency-usd" size={28} color={c.accent} />
              <Text style={[styles.balanceValue, { color: c.text }]}>{wallet.balance.toLocaleString()}</Text>
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
          <Text style={[styles.sectionCount, { color: c.textTertiary }]}>{wallet.transactions.length} transacoes</Text>
        </View>
        <View style={[styles.transactionsCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          {wallet.transactions.length === 0 ? (
            <View style={styles.transactionsEmpty}>
              <Ionicons name="receipt-outline" size={32} color={c.textTertiary} />
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>Nenhuma transacao ainda</Text>
            </View>
          ) : (
            wallet.transactions.map((tx, index) => (
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
