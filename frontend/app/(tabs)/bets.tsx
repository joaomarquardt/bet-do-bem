import { useCallback, useState } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { MyFeedItemCard } from '@/components/dashboard/MyFeedItemCard';
import { PendingInviteCard } from '@/components/dashboard/PendingInviteCard';
import { CreateContentModal } from '@/components/create/CreateContentModal';
import { CreationSuccessModal } from '@/components/create/CreationSuccessModal';
import { AcceptInviteModal } from '@/components/create/AcceptInviteModal';
import { useBets, useChallenge, useAuth } from '@/lib/contexts';
import type { ContentKind } from '@/components/create/CreateContentModal';
import {
  useMyBetsSections,
  myBetsSectionQueryKeys,
  type BetsTabSection,
} from '@/lib/hooks';
import type { BetsTabItem } from '@/lib/utils/feedItemMappers';
import { styles } from '@/styles/tabs/dashboard.styles';
import { betsService } from '@/lib/api/bets.service';
import { challengeService } from '@/lib/api/challenge.service';
import uploadFileToAWS from '@/lib/utils/uploadFileToAWS';

const c = Colors.dark;

export default function MyBetsScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const {
    sections,
    isLoading,
    isRefetching,
    refetch: refetchSections,
  } = useMyBetsSections();
  const { acceptBet, declineBet } = useBets();
  const { acceptChallenge, declineChallenge } = useChallenge();

  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdSuccessKind, setCreatedSuccessKind] = useState<ContentKind | null>(null);
  const [acceptedInviteKind, setAcceptedInviteKind] = useState<'BET' | 'CHALLENGE' | null>(null);

  const invalidateSections = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: myBetsSectionQueryKeys.all,
    });
  }, [queryClient]);

  const refreshData = useCallback(async () => {
    await refetchSections();
  }, [refetchSections]);

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: BetsTabItem;
      index: number;
      section: BetsTabSection;
    }) => {
      const isPendingInvite = section.key === 'pendingInvites';

      const handleSendProof = async (
        itemId: number,
        itemType: 'BET' | 'CHALLENGE',
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

          let resp: { uploadUrl?: string } | undefined;
          if (itemType === 'BET') {
            resp = await betsService.addProofToBet(itemId.toString(), {
              fileName,
              contentType: mime,
            });
          } else if (itemType === 'CHALLENGE') {
            resp = await challengeService.addProofToChallenge(
              itemId.toString(),
              { fileName, contentType: mime },
            );
          }

          const uploadUrl = resp?.uploadUrl;
          if (uploadUrl) {
            await uploadFileToAWS(uploadUrl, file, mime);
          }
          await invalidateSections();
          Alert.alert('Prova enviada');
        } catch (e) {
          console.error('Erro ao enviar prova', e);
          Alert.alert('Erro ao enviar prova');
        }
      };

      const onAcceptPress = async () => {
        if (item.feedItemType === 'BET') {
          await acceptBet(item.id.toString());
          setAcceptedInviteKind('BET');
        }
        if (item.feedItemType === 'CHALLENGE') {
          await acceptChallenge(item.id.toString());
          setAcceptedInviteKind('CHALLENGE');
        }
        await invalidateSections();
      };

      const onDeclinePress = async () => {
        if (item.feedItemType === 'BET') {
          await declineBet(item.id.toString());
        }
        if (item.feedItemType === 'CHALLENGE') {
          await declineChallenge(item.id.toString());
        }
        await invalidateSections();
      };

      return (
        <View style={styles.cardWrapper}>
          {isPendingInvite && user?.id != null ? (
            <PendingInviteCard
              item={item}
              index={index}
              currentUserId={user.id}
              onAccept={onAcceptPress}
              onDecline={onDeclinePress}
            />
          ) : (
            <MyFeedItemCard
              item={item}
              index={index}
              onSendProof={() =>
                handleSendProof(item.id as number, item.feedItemType)
              }
            />
          )}
        </View>
      );
    },
    [
      user?.id,
      acceptBet,
      declineBet,
      acceptChallenge,
      declineChallenge,
      invalidateSections,
    ],
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
            refreshing={isLoading || isRefetching}
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
        onCreated={(k) => {
          setCreatedSuccessKind(k);
          void invalidateSections();
        }}
      />
      <CreationSuccessModal
        kind={createdSuccessKind}
        onDismiss={() => setCreatedSuccessKind(null)}
      />
      <AcceptInviteModal
        kind={acceptedInviteKind}
        onDismiss={() => setAcceptedInviteKind(null)}
      />
    </View>
  );
}
