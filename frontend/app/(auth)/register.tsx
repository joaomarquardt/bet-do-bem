import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/contexts';
import { registerStyles as styles } from '@/styles/auth/auth.styles';

const c = Colors.dark;

export default function RegisterScreen() {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.trim() && username.trim() && password.trim() && password.length >= 4;

  const handleRegister = useCallback(async () => {
    if (!isValid) return;
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await register(username.trim(), email.trim(), password, passwordConfirmation);
    } catch {}
    setIsLoading(false);
  }, [isValid, username, email, password, passwordConfirmation, register]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: topPadding + 40 }]}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.brandSection}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={c.text} />
          </Pressable>
          <Text style={[styles.title, { color: c.text }]}>Criar Conta</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>Entre na arena e comece a desafiar!</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.formSection}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={c.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
              placeholder="Nome completo"
              placeholderTextColor={c.textTertiary}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="at" size={18} color={c.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
              placeholder="Email"
              placeholderTextColor={c.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={c.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
              placeholder="Senha (min. 4 caracteres)"
              placeholderTextColor={c.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={c.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
              placeholder="Confirme a sua senha"
              placeholderTextColor={c.textTertiary}
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: isValid ? c.accent : c.surfaceHighlight, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleRegister}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <Text style={[styles.submitBtnText, { color: '#000' }]}>Criando...</Text>
            ) : (
              <>
                <MaterialCommunityIcons name="lightning-bolt" size={18} color={isValid ? '#000' : c.textTertiary} />
                <Text style={[styles.submitBtnText, { color: isValid ? '#000' : c.textTertiary }]}>Criar Conta</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.footer}>
          <Text style={[styles.footerText, { color: c.textTertiary }]}>Ja tem conta?</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.footerLink, { color: c.accent }]}>Entrar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
