import { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { BetCard } from '@/components/feed/BetCard';
import { useBets } from '@/lib/contexts';
import { Bet } from '@/lib/types';
import { styles } from '@/styles/tabs/feed.styles';

const c = Colors.dark;

export default function FeedScreen() {
  const { feedBets, isLoading, refreshData } = useBets();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const renderItem = useCallback(({ item, index }: { item: Bet; index: number }) => {
    return <BetCard bet={item} index={index} />;
  }, []);

  const keyExtractor = useCallback((item: Bet) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: c.text }]}>Feed</Text>
          <Text style={[styles.headerSubtitle, { color: c.textSecondary }]}>Julgue as apostas da comunidade</Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: c.accentDim }]}>
          <View style={[styles.liveDot, { backgroundColor: c.accent }]} />
          <Text style={[styles.liveText, { color: c.accent }]}>AO VIVO</Text>
        </View>
      </View>
      <FlatList
        data={feedBets}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 84 : 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!feedBets.length}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} tintColor={c.accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="telescope-outline" size={48} color={c.textTertiary} />
            <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>Nenhuma aposta para julgar</Text>
            <Text style={[styles.emptyText, { color: c.textTertiary }]}>Volte mais tarde para novas apostas</Text>
          </View>
        }
      />
    </View>
  );
}
