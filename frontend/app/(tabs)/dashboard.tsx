import { useCallback, useMemo, useState } from 'react';
import { View, Text, SectionList, RefreshControl, Pressable, Platform, TextInput, Modal, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { MyBetCard } from '@/components/dashboard/MyBetCard';
import { useBets } from '@/lib/contexts';
import { Bet } from '@/lib/types';
import { styles } from '@/styles/tabs/dashboard.styles';

const c = Colors.dark;

export default function DashboardScreen() {
  const { myBets, isLoading, refreshData, acceptBet, declineBet, createBet } = useBets();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBuyIn, setNewBuyIn] = useState('');
  const [newOpponent, setNewOpponent] = useState('');

  const sections = useMemo(() => {
    const pending = myBets.filter((b) => b.status === 'INVITED' && (b.opponent.id === 'me' || (b as any).opponentId === 'me'));
    const inProgress = myBets.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'IN_JUDGMENT');
    const finished = myBets.filter((b) => b.status.startsWith('FINISHED'));
    const created = myBets.filter((b) => b.status === 'INVITED' && b.creatorId === 'me');

    const result = [];
    if (pending.length > 0) result.push({ title: 'Convites Pendentes', data: pending, key: 'pending' });
    if (created.length > 0) result.push({ title: 'Aguardando Aceite', data: created, key: 'created' });
    if (inProgress.length > 0) result.push({ title: 'Em Andamento', data: inProgress, key: 'progress' });
    if (finished.length > 0) result.push({ title: 'Historico', data: finished, key: 'history' });
    return result;
  }, [myBets]);

  const isFormValid = newTitle.trim() && newBuyIn.trim() && newOpponent.trim();

  const handleCreate = useCallback(() => {
    if (!isFormValid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createBet(newTitle.trim(), newDescription.trim(), parseInt(newBuyIn) || 10, newOpponent.trim());
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewBuyIn('');
    setNewOpponent('');
  }, [isFormValid, newTitle, newDescription, newBuyIn, newOpponent, createBet]);

  const renderItem = useCallback(
    ({ item, index }: { item: Bet; index: number }) => {
      const isPending = item.status === 'PENDING' && item.opponentId === 'me';
      return (
        <View style={styles.cardWrapper}>
          <MyBetCard
            bet={item}
            index={index}
            onAccept={isPending ? () => acceptBet(item.id) : undefined}
            onDecline={isPending ? () => declineBet(item.id) : undefined}
          />
        </View>
      );
    },
    [acceptBet, declineBet],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: Bet[] } }) => (
      <View style={[styles.sectionHeader, { backgroundColor: c.background }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{section.title}</Text>
        <View style={[styles.sectionCount, { backgroundColor: c.surfaceHighlight }]}>
          <Text style={[styles.sectionCountText, { color: c.textSecondary }]}>{section.data.length}</Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: c.text }]}>Minhas Apostas</Text>
          <Text style={[styles.headerSubtitle, { color: c.textSecondary }]}>Gerencie seus desafios</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.createBtn, { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowCreateModal(true); }}
        >
          <Ionicons name="add" size={22} color="#000" />
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 84 : 100 }]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} tintColor={c.accent} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="game-controller-outline" size={48} color={c.textTertiary} />
            <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>Nenhuma aposta ainda</Text>
            <Text style={[styles.emptyText, { color: c.textTertiary }]}>Crie um desafio para comecar!</Text>
          </View>
        }
      />

      <Modal visible={showCreateModal} animationType="slide" transparent onRequestClose={() => setShowCreateModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowCreateModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: c.text }]}>Criar Desafio</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>Titulo do desafio</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
                placeholder="Ex: 100 flexoes em 2 minutos"
                placeholderTextColor={c.textTertiary}
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>Descricao</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
                placeholder="Detalhes do desafio..."
                placeholderTextColor={c.textTertiary}
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: c.textSecondary }]}>Buy-in</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
                  placeholder="50"
                  placeholderTextColor={c.textTertiary}
                  value={newBuyIn}
                  onChangeText={setNewBuyIn}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={[styles.inputLabel, { color: c.textSecondary }]}>Oponente</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
                  placeholder="@username"
                  placeholderTextColor={c.textTertiary}
                  value={newOpponent}
                  onChangeText={setNewOpponent}
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.createSubmitBtn,
                { backgroundColor: isFormValid ? c.accent : c.surfaceHighlight, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={handleCreate}
              disabled={!isFormValid}
            >
              <Ionicons name="flash" size={18} color={isFormValid ? '#000' : c.textTertiary} />
              <Text style={[styles.createSubmitText, { color: isFormValid ? '#000' : c.textTertiary }]}>Lancar Desafio</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
