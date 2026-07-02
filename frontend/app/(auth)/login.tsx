import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/contexts';
import { loginStyles as styles } from '@/styles/auth/auth.styles';

const c = Colors.dark;

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.trim() && password.trim();

  const handleLogin = useCallback(async () => {
    if (!isValid) return;
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await login(email.trim(), password);
    } catch {}
    setIsLoading(false);
  }, [isValid, email, password, login]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: topPadding + 60 }]}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.brandSection}>
          <View style={[styles.logoContainer, { backgroundColor: 'transparent' }]}>
            <Image 
              source={require('@/assets/images/bet-do-bem-white-logo.svg')} 
              style={{ width: 80, height: 80 }} 
              contentFit="contain" 
            />
          </View>
          <Text style={[styles.appName, { color: c.text }]}>BetDoBem</Text>
          <Text style={[styles.tagline, { color: c.textSecondary }]}>Desafie seus amigos. Prove seu valor.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.formSection}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={c.textTertiary} style={styles.inputIcon} />
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
              placeholder="Senha"
              placeholderTextColor={c.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: isValid ? c.accent : c.surfaceHighlight, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleLogin}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <Text style={[styles.submitBtnText, { color: '#000' }]}>Entrando...</Text>
            ) : (
              <>
                <Text style={[styles.submitBtnText, { color: isValid ? '#000' : c.textTertiary }]}>Entrar</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.footer}>
          <Text style={[styles.footerText, { color: c.textTertiary }]}>Nao tem conta?</Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.footerLink, { color: c.accent }]}>Criar conta</Text>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
