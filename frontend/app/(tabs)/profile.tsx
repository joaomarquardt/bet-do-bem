import { useCallback, useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Alert, Modal, RefreshControl, DeviceEventEmitter } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import {
  EditableProfileAvatar,
  type PickedProfileImage,
} from '@/components/profile/EditableProfileAvatar';
import { uploadToPresignedUrl } from '@/lib/utils/uploadFileToAWS';
import { TransactionItem, type ProfileTransaction } from '@/components/profile/TransactionItem';
import { FullTransactionHistory } from '@/components/profile/FullTransactionHistory';
import { GroupInvitesSection } from '@/components/profile/GroupInvitesSection';
import { MyGroupsSection } from '@/components/profile/MyGroupsSection';
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
  const { user, logout, updateUser } = useAuth();
  const authUser: any = user;
  const rawFullName = authUser?.fullName ?? authUser?.name ?? authUser?.email ?? 'Usuário';
  const nameParts = rawFullName.trim().split(' ');
  const displayName = nameParts.length > 1 
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    : nameParts[0];
  const username = authUser?.username ?? (typeof authUser?.email === 'string' ? authUser.email.split('@')[0] : `user${authUser?.id ?? ''}`);
  const avatarColor = authUser?.avatarColor ?? stringToColor(displayName);
  const initialProfileImageUri = user?.profilePictureUrl ?? null;
  const [profileImageUri, setProfileImageUri] = useState<string | null>(initialProfileImageUri);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  useEffect(() => {
    const url = user?.profilePictureUrl;
    if (url?.startsWith('http')) {
      setProfileImageUri(url);
    }
  }, [user?.profilePictureUrl]);

  const resolveDisplayImageUrl = (url: string | null | undefined) =>
    url?.startsWith('http') ? url : null;

  const handleProfileImageSelected = useCallback(
    async (image: PickedProfileImage) => {
      setProfileImageUri(image.uri);
      setIsUploadingPicture(true);

      try {
        const { uploadUrl } = await userService.updateProfilePicture({
          fileName: image.fileName,
          contentType: image.contentType,
          imageUrl: image.uri,
        });

        await uploadToPresignedUrl(uploadUrl, { uri: image.uri, type: image.contentType }, image.contentType);

        const profile = await userService.getMyProfile();
        const serverUrl = resolveDisplayImageUrl(profile.profilePictureUrl) ?? image.uri;
        setProfileImageUri(serverUrl);
        updateUser({ profilePictureUrl: serverUrl });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.error('Erro ao enviar foto de perfil', e);
        setProfileImageUri(resolveDisplayImageUrl(user?.profilePictureUrl) ?? null);
        Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
      } finally {
        setIsUploadingPicture(false);
      }
    },
    [updateUser, user?.profilePictureUrl],
  );
  const [profileStats, setProfileStats] = useState<{ winningBets: number; registeredActivities: number; computedVotes: number } | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [previewTransactions, setPreviewTransactions] = useState<ProfileTransaction[] | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [hasMoreThanPreview, setHasMoreThanPreview] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [groupRefreshTrigger, setGroupRefreshTrigger] = useState(0);
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 84 : insets.bottom + 90;

  const handleLogout = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsLogoutModalVisible(true);
  }, []);

  const confirmLogout = useCallback(() => {
    setIsLogoutModalVisible(false);
    logout();
  }, [logout]);

  const mapApiTransactionsToDomain = (apiTxs: any[]): ProfileTransaction[] => {
    return apiTxs.map((t: any) => {
      const apiType = (t.transactionType as TransactionType) || 'BET_ENTRY';
      const mappedType = apiType as TransactionType;

      let description = '';
      switch (mappedType) {
        case 'DEPOSIT': description = 'Depósito'; break;
        case 'CHALLENGE_BUY': description = 'Resgate de direito de desafiar'; break;
        case 'CHALLENGE_ENTRY': description = 'Entrada em desafio'; break;
        case 'CHALLENGE_WIN': description = 'Vitória em desafio'; break;
        case 'CHALLENGE_REFUND': description = 'Reembolso de desafio'; break;
        case 'BET_ENTRY': description = 'Entrada em aposta'; break;
        case 'BET_WIN': description = 'Vitória em aposta'; break;
        case 'BET_REFUND': description = 'Reembolso de aposta'; break;
        case 'REWARD': description = 'Recompensa de atividade'; break;
        default: description = 'Transação'; break;
      }

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

  const loadProfileAndTransactions = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoadingWallet(true);
      setWalletError(null);
      setIsLoadingTransactions(true);
      setTransactionsError(null);
    }

    if (!user) {
      setIsLoadingWallet(false);
      setIsLoadingTransactions(false);
      return;
    }

    try {
      const profile = await userService.getMyProfile();
      const displayUrl = profile.profilePictureUrl?.startsWith('http')
        ? profile.profilePictureUrl
        : null;
      if (displayUrl) {
        setProfileImageUri(displayUrl);
        updateUser({ profilePictureUrl: displayUrl });
      }
      setProfileStats({
        winningBets: profile.winningBets ?? 0,
        registeredActivities: profile.registeredActivities ?? 0,
        computedVotes: profile.computedVotes ?? 0,
      });
      setWallet({ balance: profile.coins ?? 0, transactions: [] });

      try {
        const pagedResult = await userService.getMyTransactions({ page: 0, size: 5 });
        const mapped = mapApiTransactionsToDomain(pagedResult.content);
        setPreviewTransactions(mapped);
        setTotalTransactions(pagedResult.totalElements);
        setHasMoreThanPreview(pagedResult.hasNext);
        setWallet((prev) =>
          prev
            ? { ...prev, transactions: mapped }
            : { balance: profile.coins ?? 0, transactions: mapped },
        );
      } catch (txErr: any) {
        setPreviewTransactions(null);
        setTransactionsError(txErr?.message || 'Erro ao carregar transacoes');
      }
    } catch (err: any) {
      setWallet(null);
      setWalletError(err?.message || 'Erro ao carregar carteira');
      setPreviewTransactions(null);
      setTransactionsError(err?.message || 'Erro ao carregar transacoes');
    } finally {
      setIsLoadingWallet(false);
      setIsLoadingTransactions(false);
    }
  }, [updateUser]);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      loadProfileAndTransactions();
    }

    return () => {
      mounted = false;
    };
  }, [loadProfileAndTransactions]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('onSessionRefreshed', () => {
      loadProfileAndTransactions(true);
    });

    return () => {
      subscription.remove();
    };
  }, [loadProfileAndTransactions]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfileAndTransactions(true);
    setRefreshing(false);
  }, [loadProfileAndTransactions]);

  if (!user) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.accent} />}
    >
      <View style={[styles.header, { paddingTop: topPadding + 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }]}>
        <EditableProfileAvatar
          name={displayName}
          color={avatarColor}
          size={72}
          imageUri={profileImageUri}
          onImageSelected={handleProfileImageSelected}
          disabled={isUploadingPicture}
        />
        <View style={{ flex: 1, justifyContent: 'center', marginLeft: 16 }}>
          <Text style={[styles.displayName, { color: c.text, textAlign: 'left' }]}>{displayName}</Text>
          <Text style={[styles.username, { color: c.textSecondary, textAlign: 'left' }]}>{username ? `@${username}` : ''}</Text>
        </View>
      </View>

      {profileStats ? (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: c.winDim }]}>
            <Ionicons name="trophy" size={20} color={c.win} />
            <Text style={[styles.statValue, { color: c.win }]}>{profileStats.winningBets}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>Apostas Ganhas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.accentDim }]}>
            <Ionicons name="fitness-outline" size={20} color={c.accent} />
            <Text style={[styles.statValue, { color: c.accent }]}>{profileStats.registeredActivities}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>Atividades</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.warningDim }]}>
            <Ionicons name="checkmark-done-circle" size={20} color={c.warning} />
            <Text style={[styles.statValue, { color: c.warning }]}>{profileStats.computedVotes}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>Votos</Text>
          </View>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.walletCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.walletHeader}>
          <View>
            <Text style={[styles.walletLabel, { color: c.textSecondary }]}>Saldo de Moedas</Text>
            <View style={styles.balanceRow}>
              <FontAwesome5 name="coins" size={24} color={c.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.balanceValue, { color: c.text }]}>
                {isLoadingWallet ? 'Carregando...' : wallet ? wallet.balance.toLocaleString() : '—'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <GroupInvitesSection onInviteResponded={() => setGroupRefreshTrigger((p) => p + 1)} />
      <MyGroupsSection refreshTrigger={groupRefreshTrigger} />

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Extrato</Text>
          <Text style={[styles.sectionCount, { color: c.textTertiary }]}>{totalTransactions} transações</Text>
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
          ) : !previewTransactions || previewTransactions.length === 0 ? (
            <View style={styles.transactionsEmpty}>
              <Ionicons name="receipt-outline" size={32} color={c.textTertiary} />
              <Text style={[styles.emptyText, { color: c.textTertiary }]}>Nenhuma transação ainda</Text>
            </View>
          ) : (
            <View>
              {previewTransactions.map((tx, index) => (
                <TransactionItem key={tx.id} transaction={tx} index={index} />
              ))}
              {hasMoreThanPreview && (
                <View style={{ position: 'relative' }}>
                  <LinearGradient
                    colors={[`${c.surface}00`, c.surface]}
                    style={{
                      position: 'absolute',
                      top: -48,
                      left: 0,
                      right: 0,
                      height: 48,
                      zIndex: 1,
                    }}
                    pointerEvents="none"
                  />
                  <Pressable
                    onPress={() => setShowFullHistory(true)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 14,
                      gap: 6,
                      opacity: pressed ? 0.7 : 1,
                      borderTopWidth: 1,
                      borderTopColor: c.border,
                    })}
                  >
                    <Ionicons name="list-outline" size={16} color={c.accent} />
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: c.accent }}>
                      Ver extrato completo
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
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

      <FullTransactionHistory
        visible={showFullHistory}
        onClose={() => setShowFullHistory(false)}
        initialTransactions={previewTransactions ?? []}
        totalElements={totalTransactions}
      />

      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: c.surface, width: '100%', maxWidth: 400, borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, borderWidth: 1, borderColor: c.border }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${c.danger}20`, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="log-out-outline" size={24} color={c.danger} />
            </View>
            <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: c.text, marginBottom: 8 }}>Sair da conta</Text>
            <Text style={{ fontSize: 16, fontFamily: 'Inter_400Regular', color: c.textSecondary, textAlign: 'center', marginBottom: 24 }}>
              Tem certeza que deseja sair? Você precisará fazer login novamente para acessar a plataforma.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Pressable
                onPress={() => setIsLogoutModalVisible(false)}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: c.surface,
                  borderWidth: 1,
                  borderColor: c.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ textAlign: 'center', color: c.text, fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={confirmLogout}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: c.danger,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ textAlign: 'center', color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>Sair</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
