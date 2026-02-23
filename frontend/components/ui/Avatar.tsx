import { View, Text, StyleSheet } from 'react-native';
import { getInitials } from '@/lib/utils/formatters';

interface AvatarProps {
  name: string;
  color: string;
  size?: number;
}

export function Avatar({ name, color, size = 40 }: AvatarProps) {
  const fontSize = size * 0.38;
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.text, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#000',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
});
