import { View, Text, Image, StyleSheet } from 'react-native';
import { getInitials } from '@/lib/utils/formatters';

interface AvatarProps {
  name: string;
  color: string;
  size?: number;
  imageUri?: string | null;
}

export function Avatar({ name, color, size = 40, imageUri }: AvatarProps) {
  const fontSize = size * 0.38;
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };

  if (imageUri) {
    return (
      <View style={[styles.container, circleStyle, styles.overflowHidden]}>
        <Image source={{ uri: imageUri }} style={{ width: size, height: size }} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={[styles.container, circleStyle]}>
      <Text style={[styles.text, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
  text: {
    color: '#000',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
});
