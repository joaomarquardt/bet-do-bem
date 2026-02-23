import { View, Text, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { Bet } from '@/lib/types';
import { formatDeadline } from '@/lib/utils/formatters';
import { styles } from './MyBetCard.styles';

const c = Colors.dark;

interface MyBetCardProps {
  bet: Bet;
  index: number;
  onAccept?: () => void;
  onDecline?: () => void;
}

function getStatusConfig(bet: Bet) {
  const isCreator = bet.creatorId === 'me';
  switch (bet.status) {
    case 'PENDING':
      return { label: 'Convite Pendente', color: c.warning, bg: c.warningDim, icon: 'mail-outline' as const };
    case 'IN_PROGRESS': {
      const myProof = isCreator ? bet.creatorProof : bet.opponentProof;
      if (myProof) return { label: 'Prova Enviada', color: c.accent, bg: c.accentDim, icon: 'checkmark-circle-outline' as const };
      return { label: 'Enviar Prova', color: c.warning, bg: c.warningDim, icon: 'camera-outline' as const };
    }
    case 'IN_JUDGMENT':
      return { label: 'Em Julgamento', color: '#AB47BC', bg: 'rgba(171,71,188,0.15)', icon: 'people-outline' as const };
    case 'FINISHED_WIN_CREATOR':
      return isCreator
        ? { label: 'Vitoria', color: c.win, bg: c.winDim, icon: 'trophy-outline' as const }
        : { label: 'Derrota', color: c.loss, bg: c.lossDim, icon: 'close-circle-outline' as const };
    case 'FINISHED_WIN_OPPONENT':
      return !isCreator
        ? { label: 'Vitoria', color: c.win, bg: c.winDim, icon: 'trophy-outline' as const }
        : { label: 'Derrota', color: c.loss, bg: c.lossDim, icon: 'close-circle-outline' as const };
    case 'FINISHED_DRAW':
      return { label: 'Empate', color: c.draw, bg: c.drawDim, icon: 'swap-horizontal-outline' as const };
    default:
      return { label: bet.status, color: c.textSecondary, bg: c.surfaceHighlight, icon: 'ellipse-outline' as const };
  }
}

export function MyBetCard({ bet, index, onAccept, onDecline }: MyBetCardProps) {
  const isCreator = bet.creatorId === 'me';
  const otherPlayer = isCreator ? bet.opponent : bet.creator;
  const statusConfig = getStatusConfig(bet);

  return (
    <Animated.View entering={FadeInRight.delay(index * 60).duration(300)} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
        <View style={[styles.buyInBadge, { backgroundColor: c.warningDim }]}>
          <MaterialCommunityIcons name="currency-usd" size={12} color={c.warning} />
          <Text style={[styles.buyInText, { color: c.warning }]}>{bet.buyIn}</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>{bet.title}</Text>

      <View style={styles.opponentRow}>
        <Text style={[styles.vsLabel, { color: c.textTertiary }]}>{isCreator ? 'vs' : 'de'}</Text>
        <Avatar name={otherPlayer.displayName} color={otherPlayer.avatarColor} size={24} />
        <Text style={[styles.opponentName, { color: c.textSecondary }]}>@{otherPlayer.username}</Text>
        <Text style={[styles.deadline, { color: c.textTertiary }]}>{formatDeadline(bet.deadline)}</Text>
      </View>

      {bet.status === 'PENDING' && !isCreator && onAccept && onDecline && (
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.declineBtn, { borderColor: c.danger, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDecline(); }}
          >
            <Ionicons name="close" size={18} color={c.danger} />
            <Text style={[styles.actionText, { color: c.danger }]}>Recusar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.acceptBtn, { backgroundColor: c.accent, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onAccept(); }}
          >
            <Ionicons name="checkmark" size={18} color="#000" />
            <Text style={[styles.actionText, { color: '#000' }]}>Aceitar</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}
