import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  RefreshControl,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { MyFeedItemCard } from '@/components/dashboard/MyFeedItemCard';
import { CreateContentModal } from '@/components/create/CreateContentModal';
import { useBets, useActivity, useChallenge, useAuth } from '@/lib/contexts';
import { Bet, Activity, Challenge } from '@/lib/types';
import { styles } from '@/styles/tabs/dashboard.styles';
import { betsService } from '@/lib/api/bets.service';
import { activityService } from '@/lib/api/activity.service';
import { challengeService } from '@/lib/api/challenge.service';
import uploadFileToAWS from '@/lib/utils/uploadFileToAWS';

const c = Colors.dark;

type BetsTabItem = (Bet | Activity | Challenge) & {
  feedItemType: 'BET' | 'ACTIVITY' | 'CHALLENGE';
};

type BetsTabSection = {
  title: string;
  key: 'pendingInvites' | 'awaitingAcceptance' | 'inProgress' | 'history';
  data: BetsTabItem[];
};

function buildBetsSections(
  allItems: BetsTabItem[],
  currentUserId: number | undefined,
): BetsTabSection[] {
  const pendingInvites = allItems.filter(
    (item) =>
      item.status === 'INVITED' &&
      'opponent' in item &&
      currentUserId != null &&
      item.opponent?.id === currentUserId,
  );

  const awaitingAcceptance = allItems.filter(
    (item) =>
      item.status === 'INVITED' &&
      'creator' in item &&
      currentUserId != null &&
      item.creator?.id === currentUserId,
  );

  const inProgress = allItems.filter(
    (item) => item.status === 'IN_PROGRESS' || item.status === 'IN_JUDGMENT',
  );

  const history = allItems.filter(
    (item) =>
      (typeof item.status === 'string' &&
        item.status.startsWith('FINISHED')) ||
      item.status === 'SUCCESS' ||
      item.status === 'FAILED' ||
      item.status === 'APPROVED' ||
      item.status === 'REJECTED',
  );

  const sections: BetsTabSection[] = [];

  if (pendingInvites.length > 0) {
    sections.push({
      title: 'Convites Pendentes',
      key: 'pendingInvites',
      data: pendingInvites,
    });
  }

  if (awaitingAcceptance.length > 0) {
    sections.push({
      title: 'Aguardando Aceite',
      key: 'awaitingAcceptance',
      data: awaitingAcceptance,
    });
  }

  if (inProgress.length > 0) {
    sections.push({
      title: 'Em Andamento',
      key: 'inProgress',
      data: inProgress,
    });
  }

  if (history.length > 0) {
    sections.push({
      title: 'Historico',
      key: 'history',
      data: history,
    });
  }

  return sections;
}

export default function MyBetsScreen() {
  const { user } = useAuth();
  const {
    myBets,
    isLoading: betsLoading,
    refreshData: refreshBets,
    acceptBet,
    declineBet,
  } = useBets();
  const {
    activities,
    isLoading: activitiesLoading,
    refreshData: refreshActivities,
  } = useActivity();
  const {
    challenges,
    isLoading: challengesLoading,
    refreshData: refreshChallenges,
    acceptChallenge,
    declineChallenge,
  } = useChallenge();

  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const [showCreateModal, setShowCreateModal] = useState(false);

  const sections = useMemo<BetsTabSection[]>(() => {
    const allItems: BetsTabItem[] = [
      ...myBets.map((bet) => ({ ...bet, feedItemType: 'BET' as const })),
      ...activities.map((activity) => ({
        ...activity,
        feedItemType: 'ACTIVITY' as const,
      })),
      ...challenges.map((challenge) => ({
        ...challenge,
        feedItemType: 'CHALLENGE' as const,
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return buildBetsSections(allItems, user?.id as number | undefined);
  }, [myBets, activities, challenges, user?.id]);

  const isLoading = betsLoading || activitiesLoading || challengesLoading;

  const refreshData = useCallback(() => {
    refreshBets();
    refreshActivities();
    refreshChallenges();
  }, [refreshBets, refreshActivities, refreshChallenges]);

  const renderItem = useCallback(
    ({ item, index }: { item: BetsTabItem; index: number }) => {
      const isPendingInvite =
        item.status === 'INVITED' &&
        'opponent' in item &&
        item.opponent?.id === (user?.id ?? undefined);

      const handleSendProof = async (
        itemId: number,
        itemType: 'BET' | 'ACTIVITY' | 'CHALLENGE',
      ) => {
        try {
          const pickFileWebFile = (): Promise<File | null> =>
            new Promise((resolve) => {
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
                console.error('pickFileWebFile', e);
                resolve(null);
              }
            });

          let file: File | { uri: string; type: string } | null = null;
          let fileName = '';
          let mime = '';

          if (Platform.OS === 'web') {
            const webFile = await pickFileWebFile();
            if (!webFile) {
              Alert.alert('Nenhum arquivo selecionado');
              return;
            }
            file = webFile;
            fileName = webFile.name;
            mime =
              webFile.type === 'video'
                ? 'video/mp4'
                : webFile.type === 'image'
                ? 'image/jpeg'
                : 'application/octet-stream';
          } else {
            // Implementar selecao de arquivo em mobile quando necessario
          }

          if (!file) return;

          let resp: any;
          if (itemType === 'BET') {
            resp = await betsService.addProofToBet(itemId.toString(), {
              fileName,
              contentType: mime,
            } as any);
          } else if (itemType === 'CHALLENGE') {
            resp = await challengeService.addProofToChallenge(
              itemId.toString(),
              { fileName, contentType: mime } as any,
            );
          } else if (itemType === 'ACTIVITY') {
            resp = await activityService.addProofToActivity(
              itemId.toString(),
              { fileName, contentType: mime } as any,
            );
          }

          const uploadUrl: string | undefined = resp?.uploadUrl;
          if (uploadUrl) {
            await uploadFileToAWS(uploadUrl, file, mime);
          }
          refreshData();
          Alert.alert('Prova enviada');
        } catch (e) {
          console.error('Erro ao enviar prova', e);
          Alert.alert('Erro ao enviar prova');
        }
      };

      const onAcceptPress = () => {
        if (item.feedItemType === 'BET') {
          acceptBet(item.id.toString());
        }
        if (item.feedItemType === 'CHALLENGE') {
          acceptChallenge(item.id.toString());
        }
      };

      const onDeclinePress = () => {
        if (item.feedItemType === 'BET') {
          declineBet(item.id.toString());
        }
        if (item.feedItemType === 'CHALLENGE') {
          declineChallenge(item.id.toString());
        }
      };

      return (
        <View style={styles.cardWrapper}>
          <MyFeedItemCard
            item={item}
            index={index}
            onAccept={isPendingInvite ? onAcceptPress : undefined}
            onDecline={isPendingInvite ? onDeclinePress : undefined}
            onSendProof={() =>
              handleSendProof(item.id as number, item.feedItemType)
            }
          />
        </View>
      );
    },
    [acceptBet, declineBet, acceptChallenge, declineChallenge, user?.id, refreshData],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: BetsTabSection }) => (
      <View style={[styles.sectionHeader, { backgroundColor: c.background }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          {section.title}
        </Text>
        <View
          style={[
            styles.sectionCount,
            { backgroundColor: c.surfaceHighlight },
          ]}
        >
          <Text
            style={[styles.sectionCountText, { color: c.textSecondary }]}
          >
            {section.data.length}
          </Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: c.text }]}>
            Minhas Apostas
          </Text>
          <Text style={[styles.headerSubtitle, { color: c.textSecondary }]}>
            Gerencie seus desafios
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.createBtn,
            {
              backgroundColor: c.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCreateModal(true);
          }}
        >
          <Ionicons name="add" size={22} color="#000" />
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => `${item.feedItemType}-${item.id.toString()}`}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === 'web' ? 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            tintColor={c.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="game-controller-outline"
              size={48}
              color={c.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>
              Nenhuma aposta ainda
            </Text>
            <Text style={[styles.emptyText, { color: c.textTertiary }]}>
              Crie um desafio para comecar!
            </Text>
          </View>
        }
      />

      <CreateContentModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}

