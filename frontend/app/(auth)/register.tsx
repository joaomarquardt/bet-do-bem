import { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Platform, KeyboardAvoidingView, Alert } from 'react-native';
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
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: 'success' | 'error'; text: string }>(null);

  const isValid = email.trim() && name.trim() && username.trim() && password.trim() && password.length >= 4;

  const handleRegister = useCallback(async () => {
    if (!isValid) return;

    if (password !== passwordConfirmation) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await register(name.trim(), username.trim(), email.trim(), password, passwordConfirmation);
      console.log('Registro bem-sucedido!');
      setIsLoading(false);

      const successText = 'Conta criada com sucesso!';
      setFeedback({ type: 'success', text: successText });
      try {
        Alert.alert('Sucesso!', successText);
      } catch {}

      setTimeout(() => router.replace('/(auth)/login'), 2200);
      setTimeout(() => setFeedback(null), 5000);
    } catch (error: any) {
      console.error('Erro capturado:', error);
      setIsLoading(false);
      const status = error?.status;
      const message = error?.message || 'Erro ao criar conta. Tente novamente.';
      const text = status ? `Erro ${status}: ${message}` : message;
      setFeedback({ type: 'error', text });
      try {
        Alert.alert('Erro no Registro', text);
      } catch {}
      setTimeout(() => setFeedback(null), 6000);
    }
  }, [isValid, name, username, email, password, passwordConfirmation, register]);

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
          {feedback ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                marginBottom: 14,
                backgroundColor: feedback.type === 'success' ? c.surfaceElevated : c.surfaceElevated,
                borderWidth: 1,
                borderColor: feedback.type === 'success' ? c.accentBorder : c.dangerDim || 'rgba(255,71,87,0.15)',
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 6,
              }}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: feedback.type === 'success' ? c.accentDim : c.dangerDim,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <MaterialCommunityIcons name={feedback.type === 'success' ? 'check' : 'alert-circle'} size={18} color={feedback.type === 'success' ? '#000' : c.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: '600' }}>{feedback.type === 'success' ? 'Sucesso' : 'Erro'}</Text>
                <Text style={{ color: c.textSecondary, marginTop: 4 }}>{feedback.text}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={c.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
              placeholder="Nome completo"
              placeholderTextColor={c.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="at" size={18} color={c.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { backgroundColor: c.surfaceElevated, color: c.text, borderColor: c.border }]}
              placeholder="Nome de usuário"
              placeholderTextColor={c.textTertiary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
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
