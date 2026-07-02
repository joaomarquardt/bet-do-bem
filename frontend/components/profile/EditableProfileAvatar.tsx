import { useCallback } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Avatar } from '@/components/ui/Avatar';
import { styles } from '@/styles/tabs/profile.styles';

const c = Colors.dark;

export type PickedProfileImage = {
  uri: string;
  fileName: string;
  contentType: string;
};

interface EditableProfileAvatarProps {
  name: string;
  color: string;
  size?: number;
  imageUri?: string | null;
  onImageSelected: (image: PickedProfileImage) => void;
  disabled?: boolean;
}

export function EditableProfileAvatar({
  name,
  color,
  size = 72,
  imageUri,
  onImageSelected,
  disabled = false,
}: EditableProfileAvatarProps) {
  const pickProfileImage = useCallback(async () => {
    if (disabled) return;

    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos acessar sua galeria para escolher a foto de perfil.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const fileName = asset.fileName ?? `profile_${Date.now()}.jpg`;
      const contentType = asset.mimeType ?? 'image/jpeg';

      onImageSelected({ uri: asset.uri, fileName, contentType });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.error('Erro ao escolher foto de perfil', e);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  }, [disabled, onImageSelected]);

  const badgeSize = Math.round(size * 0.39);

  return (
    <View style={[styles.avatarContainer, { width: size, height: size }]}>
      <Avatar name={name} color={color} size={size} imageUri={imageUri} />
      <Pressable
        style={({ pressed }) => [
          styles.editBadge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: c.surface,
            borderColor: c.background,
            opacity: pressed || disabled ? 0.7 : 1,
          },
        ]}
        onPress={pickProfileImage}
        disabled={disabled}
        accessibilityLabel="Alterar foto de perfil"
        accessibilityRole="button"
      >
        <Ionicons name="camera" size={Math.round(badgeSize * 0.6)} color={c.accent} />
      </Pressable>
    </View>
  );
}
