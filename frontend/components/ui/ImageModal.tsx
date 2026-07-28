import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface ImageModalProps {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}

export function ImageModal({ visible, uri, onClose }: ImageModalProps) {
  if (!uri) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        <Image 
          source={{ uri }} 
          style={styles.image} 
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
