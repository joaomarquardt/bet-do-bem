import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Transaction } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils/formatters';
import { styles } from './TransactionItem.styles';

const c = Colors.dark;

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
}

function getTransactionConfig(type: Transaction['type']) {
  switch (type) {
    case 'BET_ENTRY':
    case 'CHALLENGE_ENTRY':
      return { icon: 'arrow-up-circle' as const, color: c.loss };
    case 'BET_WIN':
    case 'CHALLENGE_WIN':
    case 'REWARD':
    case 'BET_REFUND':
    case 'CHALLENGE_REFUND':
      return { icon: 'swap-horizontal' as const, color: c.draw };
    default:
      return { icon: 'receipt-outline' as const, color: c.textTertiary };
  }
}

export function TransactionItem({ transaction, index }: TransactionItemProps) {
  const config = getTransactionConfig(transaction.type);
  const isPositive = transaction.amount > 0;

  return (
    <Animated.View entering={FadeInRight.delay(index * 40).duration(250)} style={[styles.container, { borderBottomColor: c.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: isPositive ? c.winDim : c.lossDim }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.description, { color: c.text }]} numberOfLines={1}>{transaction.description}</Text>
        <Text style={[styles.date, { color: c.textTertiary }]}>{formatTimeAgo(transaction.createdAt)}</Text>
      </View>
      <Text style={[styles.amount, { color: isPositive ? c.win : c.loss }]}>
        {isPositive ? '+' : ''}{transaction.amount}
      </Text>
    </Animated.View>
  );
}
