
import { useCallback, useMemo, useState } from 'react';
import { View, Text, SectionList, RefreshControl, Pressable, Platform, TextInput, Modal, KeyboardAvoidingView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { MyFeedItemCard } from '@/components/dashboard/MyFeedItemCard';
import { useBets, useActivity, useChallenge, useAuth } from '@/lib/contexts';
import { Bet, Activity, Challenge, CreateBetRequest } from '@/lib/types';
import { styles } from '@/styles/tabs/dashboard.styles';
import { betsService } from '@/lib/api/bets.service';
import { activityService } from '@/lib/api/activity.service';
import { challengeService } from '@/lib/api/challenge.service';
import uploadFileToAWS from '@/lib/utils/uploadFileToAWS';

const c = Colors.dark;

export default function DashboardScreen() {
  const { user } = useAuth();
  const { myBets, isLoading: betsLoading, refreshData: refreshBets, acceptBet, declineBet, createBet } = useBets();
  const { activities, isLoading: activitiesLoading, refreshData: refreshActivities } = useActivity();
  const { challenges, isLoading: challengesLoading, refreshData: refreshChallenges, acceptChallenge, declineChallenge } = useChallenge();

  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBuyIn, setNewBuyIn] = useState('');
  const [newOpponent, setNewOpponent] = useState('');

  const sections = useMemo(() => {
    const allItems = [
        ...myBets.map(bet => ({ ...bet, feedItemType: 'BET' as const })),
        ...activities.map(activity => ({ ...activity, feedItemType: 'ACTIVITY' as const })),
        ...challenges.map(challenge => ({ ...challenge, feedItemType: 'CHALLENGE' as const })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const pending = allItems.filter((i) => i.status === 'INVITED' && ('opponent' in i ? i.opponent.id === user?.id : false));
    const inProgress = allItems.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'IN_JUDGMENT');
    const finished = allItems.filter((i) => i.status.startsWith('FINISHED') || i.status === 'SUCCESS' || i.status === 'FAILED' || i.status === 'APPROVED' || i.status === 'REJECTED');
    const created = allItems.filter((i) => i.status === 'INVITED' && ('creator' in i ? i.creator.id === user?.id : false));

    const result: { title: string; data: any[], key: string }[] = [];
    if (pending.length > 0) result.push({ title: 'Convites Pendentes', data: pending, key: 'pending' });
    if (created.length > 0) result.push({ title: 'Aguardando Aceite', data: created, key: 'created' });
    if (inProgress.length > 0) result.push({ title: 'Em Andamento', data: inProgress, key: 'progress' });
    if (finished.length > 0) result.push({ title: 'Historico', data: finished, key: 'history' });
    return result;
  }, [myBets, activities, challenges, user?.id]);

  const isLoading = betsLoading || activitiesLoading || challengesLoading;

    const refreshData = useCallback(() => {
        refreshBets();
        refreshActivities();
        refreshChallenges();
    }, [refreshBets, refreshActivities, refreshChallenges]);

  const isFormValid = newTitle.trim() && newBuyIn.trim() && newOpponent.trim();

  const handleCreate = useCallback(() => {
    if (!isFormValid || !user) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Implement bet creation by frontend
    const betRequest: CreateBetRequest = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        buyIn: parseInt(newBuyIn) || 10,
        creatorId: user.id as number,
        opponentId: 0,
        groupId: 1,
    }
    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewBuyIn('');
    setNewOpponent('');
  }, [isFormValid, newTitle, newDescription, newBuyIn, newOpponent, createBet, user]);

  const renderItem = useCallback(
    ({ item, index }: { item: (Bet | Activity | Challenge) & { feedItemType: 'BET' | 'ACTIVITY' | 'CHALLENGE' }; index: number }) => {
      const isPending = item.status === 'INVITED' && ( 'opponent' in item ? item.opponent.id === user?.id : false);
      const handleSendProof = async (itemId: number, itemType: 'BET' | 'ACTIVITY' | 'CHALLENGE') => {
        try {
          const pickFileWebFile = (): Promise<File | null> => new Promise((resolve) => {
            try {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*,video/*';
              input.onchange = () => {
                const file = input.files?.[0] ?? null;
                resolve(file);
              };
              input.click();
            } catch (e) {
              resolve(null);
            }
          });

          let file: File | { uri: string; type: string } | null = null;
          let fileName = '';
          let mime = '';

          if (Platform.OS === 'web') {
            const webFile = await pickFileWebFile();
            if (!webFile) { Alert.alert('Nenhum arquivo selecionado'); return; }
            file = webFile;
            fileName = webFile.name;
            mime = webFile.type === 'video' ? 'video/mp4' : (webFile.type === 'image' ? 'image/jpeg' : 'application/octet-stream');
        } else {
            // ... (mobile implementation remains the same)
          }

          if (!file) return;

          let resp: any;
          if (itemType === 'BET') {
            resp = await betsService.addProofToBet(itemId.toString(), { fileName, contentType: mime } as any);
          } else if (itemType === 'CHALLENGE') {
            resp = await challengeService.addProofToChallenge(itemId.toString(), { fileName, contentType: mime } as any);
          } else if (itemType === 'ACTIVITY') {
            resp = await activityService.addProofToActivity(itemId.toString(), { fileName, contentType: mime } as any);
          }

            const uploadUrl: string | undefined = resp?.uploadUrl;
            if (uploadUrl) await uploadFileToAWS(uploadUrl, file, mime);
            refreshData();
            Alert.alert('Prova enviada');

        } catch (e) {
          console.error('Erro ao enviar prova', e);
          Alert.alert('Erro ao enviar prova');
        }
      };

      const onAcceptPress = () => {
        if (item.feedItemType === 'BET') acceptBet(item.id.toString());
        if (item.feedItemType === 'CHALLENGE') acceptChallenge(item.id.toString());
      }

      const onDeclinePress = () => {
        if (item.feedItemType === 'BET') declineBet(item.id.toString());
        if (item.feedItemType === 'CHALLENGE') declineChallenge(item.id.toString());
      }

      return (
        <View style={styles.cardWrapper}>
          <MyFeedItemCard
            item={item}
            index={index}
            onAccept={isPending ? onAcceptPress : undefined}
            onDecline={isPending ? onDeclinePress : undefined}
            onSendProof={() => handleSendProof(item.id as number, item.feedItemType)}
          />
        </View>
      );
    },
    [acceptBet, declineBet, acceptChallenge, declineChallenge, user?.id],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: any[] } }) => (
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
        keyExtractor={(item) => `${item.feedItemType}-${item.id.toString()}`}
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
