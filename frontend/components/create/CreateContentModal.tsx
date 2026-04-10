import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import {
  useActivity,
  useAuth,
  useBets,
  useChallenge,
  useGroup,
} from '@/lib/contexts';
import type {
  CreateActivityRequest,
  CreateBetRequest,
  CreateChallengeRequest,
} from '@/lib/types';
import { styles as dashStyles } from '@/styles/tabs/dashboard.styles';
import { createContentModalStyles as localStyles } from '@/styles/components/createContentModal.styles';

const c = Colors.dark;

type ContentKind = 'BET' | 'CHALLENGE' | 'ACTIVITY';

type Step = 'type' | 'form';

type ActivityProofDraft = {
  fileName: string;
  contentType: string;
  uri: string;
};

function getErrorMessage(e: unknown): string {
  if (
    e &&
    typeof e === 'object' &&
    'message' in e &&
    typeof (e as { message: string }).message === 'string'
  ) {
    return (e as { message: string }).message;
  }
  return 'Não foi possível concluir. Tente novamente.';
}

function formatLocalDatetime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseLocalDatetime(s: string) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function WebDatetimeLocalInput({
  value,
  onChange,
  min,
}: {
  value: Date;
  onChange: (d: Date) => void;
  min: Date;
}) {
  return React.createElement('input', {
    type: 'datetime-local',
    value: formatLocalDatetime(value),
    min: formatLocalDatetime(min),
    onChange: (e: { target: { value: string } }) => {
      onChange(parseLocalDatetime(e.target.value));
    },
    style: {
      width: '100%',
      fontSize: 15,
      fontFamily: 'system-ui, Inter, sans-serif',
      paddingLeft: 14,
      paddingRight: 14,
      paddingTop: 12,
      paddingBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceElevated,
      color: c.text,
      boxSizing: 'border-box',
    },
  });
}

type CreateContentModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function CreateContentModal({ visible, onClose }: CreateContentModalProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { groups, activeGroup } = useGroup();
  const { createBet } = useBets();
  const { createChallenge } = useChallenge();
  const { createActivity } = useActivity();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step, setStep] = useState<Step>('type');
  const [contentType, setContentType] = useState<ContentKind | null>(null);

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const [betTitle, setBetTitle] = useState('');
  const [betDescription, setBetDescription] = useState('');
  const [betBuyIn, setBetBuyIn] = useState('');
  const [betOpponentId, setBetOpponentId] = useState<number | null>(null);

  const [chTitle, setChTitle] = useState('');
  const [chDescription, setChDescription] = useState('');
  const [chAmount, setChAmount] = useState('');
  const [chChallengedId, setChChallengedId] = useState<number | null>(null);
  const [chDeadline, setChDeadline] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d;
  });
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  const [actDescription, setActDescription] = useState('');
  const [actProof, setActProof] = useState<ActivityProofDraft | null>(null);

  const resetAll = useCallback(() => {
    setStep('type');
    setContentType(null);
    setSelectedGroupId(null);
    setBetTitle('');
    setBetDescription('');
    setBetBuyIn('');
    setBetOpponentId(null);
    setChTitle('');
    setChDescription('');
    setChAmount('');
    setChChallengedId(null);
    const d = new Date();
    d.setHours(d.getHours() + 1);
    setChDeadline(d);
    setShowDeadlinePicker(false);
    setActDescription('');
    setActProof(null);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetAll();
    }
  }, [visible, resetAll]);

  useEffect(() => {
    if (visible && activeGroup) {
      setSelectedGroupId(activeGroup.id);
    }
  }, [visible, activeGroup]);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const membersExcludingSelf = useMemo(() => {
    if (!selectedGroup || !user) return [];
    return selectedGroup.members.filter((m) => m.id !== user.id);
  }, [selectedGroup, user]);

  const minDeadline = useMemo(() => {
    const m = new Date();
    m.setMinutes(m.getMinutes() + 1);
    return m;
  }, []);

  const betValid =
    !!betTitle.trim() &&
    !!betDescription.trim() &&
    !!betBuyIn.trim() &&
    Number.parseInt(betBuyIn, 10) >= 1 &&
    betOpponentId != null &&
    selectedGroupId != null;

  const chValid =
    !!chTitle.trim() &&
    !!chDescription.trim() &&
    !!chAmount.trim() &&
    Number.parseInt(chAmount, 10) >= 1 &&
    chChallengedId != null &&
    selectedGroupId != null &&
    chDeadline.getTime() > Date.now();

  const actValid =
    !!actDescription.trim() &&
    selectedGroupId != null &&
    actProof != null;

  const formValid =
    contentType === 'BET'
      ? betValid
      : contentType === 'CHALLENGE'
        ? chValid
        : contentType === 'ACTIVITY'
          ? actValid
          : false;

  const pickActivityProof = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos acessar sua galeria para anexar a prova.',
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.85,
      });
      if (result.canceled || !result.assets[0]) return;
      const a = result.assets[0];
      const fileName =
        a.fileName ?? `proof_${Date.now()}.${a.type === 'video' ? 'mp4' : 'jpg'}`;
      const contentType =
        a.mimeType ??
        (a.type === 'video' ? 'video/mp4' : 'image/jpeg');
      setActProof({
        fileName,
        contentType,
        uri: a.uri,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.error('Erro ao escolher mídia', e);
      Alert.alert('Erro', 'Não foi possível abrir a galeria.');
    }
  }, []);

  const onDeadlineChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (event.type === 'dismissed') {
        setShowDeadlinePicker(false);
        return;
      }
      if (Platform.OS === 'android') {
        setShowDeadlinePicker(false);
      }
      if (date) {
        setChDeadline(date);
      }
    },
    [],
  );

  const handleSelectType = useCallback((kind: ContentKind) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContentType(kind);
    setStep('form');
  }, []);

  const handleBackToTypes = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('type');
    setContentType(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formValid || !contentType || !user) return;
    setIsSubmitting(true);
    try {
      if (contentType === 'BET') {
        const body: CreateBetRequest = {
          title: betTitle.trim(),
          description: betDescription.trim(),
          buyIn: Number.parseInt(betBuyIn, 10),
          opponentId: betOpponentId!,
          groupId: selectedGroupId!,
        };
        await createBet(body);
      } else if (contentType === 'CHALLENGE') {
        const body: CreateChallengeRequest = {
          challengedId: chChallengedId!,
          title: chTitle.trim(),
          description: chDescription.trim(),
          amount: Number.parseInt(chAmount, 10),
          deadline: chDeadline.toISOString(),
          groupId: selectedGroupId!,
        };
        await createChallenge(body);
      } else {
        if (!actProof) return;
        const body: CreateActivityRequest = {
          proof: {
            fileName: actProof.fileName,
            contentType: actProof.contentType,
          },
          description: actDescription.trim(),
          groupId: selectedGroupId!,
        };
        await createActivity(body, { uri: actProof.uri });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso', 'Item criado com sucesso.', [
        { text: 'OK', onPress: onClose },
      ]);
    } catch (e) {
      console.error('CreateContentModal submit', e);
      Alert.alert('Erro', getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formValid,
    contentType,
    user,
    betTitle,
    betDescription,
    betBuyIn,
    betOpponentId,
    selectedGroupId,
    chTitle,
    chDescription,
    chAmount,
    chChallengedId,
    chDeadline,
    actDescription,
    actProof,
    createBet,
    createChallenge,
    createActivity,
    onClose,
  ]);

  const formTitle =
    contentType === 'BET'
      ? 'Nova aposta'
      : contentType === 'CHALLENGE'
        ? 'Novo desafio'
        : contentType === 'ACTIVITY'
          ? 'Nova atividade'
          : '';

  const renderGroupPicker = () => (
    <View style={localStyles.pickerSection}>
      <Text style={[localStyles.pickerLabel, { color: c.textSecondary }]}>
        Grupo
      </Text>
      {groups.length === 0 ? (
        <Text style={[localStyles.emptyMembers, { color: c.textTertiary }]}>
          Nenhum grupo disponível. Entre em um grupo primeiro.
        </Text>
      ) : (
        <View style={localStyles.chipRow}>
          {groups.map((g) => {
            const selected = g.id === selectedGroupId;
            return (
              <Pressable
                key={g.id}
                onPress={() => {
                  setSelectedGroupId(g.id);
                  setBetOpponentId(null);
                  setChChallengedId(null);
                }}
                style={[
                  localStyles.groupChip,
                  {
                    borderColor: selected ? c.accent : c.border,
                    backgroundColor: selected ? c.accentDim : c.surfaceElevated,
                  },
                ]}
              >
                <Text
                  style={[
                    localStyles.groupChipText,
                    { color: selected ? c.accent : c.text },
                  ]}
                  numberOfLines={1}
                >
                  {g.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderMemberPicker = (
    label: string,
    selectedId: number | null,
    onSelect: (id: number) => void,
  ) => (
    <View style={localStyles.pickerSection}>
      <Text style={[localStyles.pickerLabel, { color: c.textSecondary }]}>
        {label}
      </Text>
      {!selectedGroup ? (
        <Text style={[localStyles.emptyMembers, { color: c.textTertiary }]}>
          Selecione um grupo.
        </Text>
      ) : membersExcludingSelf.length === 0 ? (
        <Text style={[localStyles.emptyMembers, { color: c.textTertiary }]}>
          Não há outros membros neste grupo.
        </Text>
      ) : (
        <ScrollView
          style={localStyles.memberList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {membersExcludingSelf.map((m) => {
            const selected = m.id === selectedId;
            return (
              <Pressable
                key={m.id}
                onPress={() => onSelect(m.id)}
                style={[
                  localStyles.memberRow,
                  {
                    borderColor: selected ? c.accent : c.border,
                    backgroundColor: selected ? c.accentDim : c.surfaceElevated,
                  },
                ]}
              >
                <View>
                  <Text style={[localStyles.memberName, { color: c.text }]}>
                    {m.name}
                  </Text>
                  <Text style={[localStyles.memberId, { color: c.textTertiary }]}>
                    ID {m.id}
                  </Text>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color={c.accent} />
                ) : (
                  <Ionicons name="ellipse-outline" size={22} color={c.textTertiary} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  const renderDeadlinePicker = () => (
    <View style={localStyles.pickerSection}>
      <Text style={[localStyles.pickerLabel, { color: c.textSecondary }]}>
        Prazo limite
      </Text>
      {Platform.OS === 'web' ? (
        <View style={localStyles.webDatetimeWrap}>
          <WebDatetimeLocalInput
            value={chDeadline}
            onChange={setChDeadline}
            min={minDeadline}
          />
        </View>
      ) : (
        <>
          <Pressable
            onPress={() => setShowDeadlinePicker(true)}
            style={[
              localStyles.deadlinePressable,
              {
                backgroundColor: c.surfaceElevated,
                borderColor: c.border,
              },
            ]}
          >
            <Text style={[localStyles.deadlineText, { color: c.text }]}>
              {chDeadline.toLocaleString(
                Platform.OS === 'ios' ? 'pt-BR' : undefined,
                {
                  dateStyle: 'short',
                  timeStyle: 'short',
                },
              )}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={c.accent} />
          </Pressable>
          {Platform.OS === 'android' && showDeadlinePicker ? (
            <DateTimePicker
              value={chDeadline}
              mode="datetime"
              display="default"
              minimumDate={minDeadline}
              onChange={onDeadlineChange}
            />
          ) : null}
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showDeadlinePicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDeadlinePicker(false)}
            >
              <Pressable
                style={dashStyles.modalOverlay}
                onPress={() => setShowDeadlinePicker(false)}
              >
                <Pressable
                  style={[
                    dashStyles.modalContent,
                    {
                      backgroundColor: c.surface,
                      paddingBottom: insets.bottom + 16,
                    },
                  ]}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View style={dashStyles.modalHandle} />
                  <DateTimePicker
                    value={chDeadline}
                    mode="datetime"
                    display="spinner"
                    minimumDate={minDeadline}
                    onChange={onDeadlineChange}
                  />
                  <Pressable
                    onPress={() => setShowDeadlinePicker(false)}
                    style={[
                      dashStyles.createSubmitBtn,
                      { backgroundColor: c.accent, marginTop: 8 },
                    ]}
                  >
                    <Text
                      style={[dashStyles.createSubmitText, { color: '#000' }]}
                    >
                      Concluir
                    </Text>
                  </Pressable>
                </Pressable>
              </Pressable>
            </Modal>
          ) : null}
        </>
      )}
    </View>
  );

  const renderBetForm = () => (
    <>
      {renderGroupPicker()}
      <View style={dashStyles.inputGroup}>
        <Text style={[dashStyles.inputLabel, { color: c.textSecondary }]}>
          Título da aposta
        </Text>
        <TextInput
          style={[
            dashStyles.input,
            {
              backgroundColor: c.surfaceElevated,
              color: c.text,
              borderColor: c.border,
            },
          ]}
          placeholder="Ex.: Quem corre mais 5 km"
          placeholderTextColor={c.textTertiary}
          value={betTitle}
          onChangeText={setBetTitle}
        />
      </View>
      <View style={dashStyles.inputGroup}>
        <Text style={[dashStyles.inputLabel, { color: c.textSecondary }]}>
          Descrição
        </Text>
        <TextInput
          style={[
            dashStyles.input,
            dashStyles.inputMultiline,
            {
              backgroundColor: c.surfaceElevated,
              color: c.text,
              borderColor: c.border,
            },
          ]}
          placeholder="Regras e detalhes..."
          placeholderTextColor={c.textTertiary}
          value={betDescription}
          onChangeText={setBetDescription}
          multiline
          numberOfLines={3}
        />
      </View>
      <View style={dashStyles.inputRow}>
        <View style={[dashStyles.inputGroup, { flex: 1 }]}>
          <Text style={[dashStyles.inputLabel, { color: c.textSecondary }]}>
            Buy-in (coins)
          </Text>
          <TextInput
            style={[
              dashStyles.input,
              {
                backgroundColor: c.surfaceElevated,
                color: c.text,
                borderColor: c.border,
              },
            ]}
            placeholder="50"
            placeholderTextColor={c.textTertiary}
            value={betBuyIn}
            onChangeText={setBetBuyIn}
            keyboardType="numeric"
          />
        </View>
      </View>
      {renderMemberPicker('Oponente', betOpponentId, setBetOpponentId)}
    </>
  );

  const renderChallengeForm = () => (
    <>
      {renderGroupPicker()}
      {renderMemberPicker('Desafiado', chChallengedId, setChChallengedId)}
      <View style={dashStyles.inputGroup}>
        <Text style={[dashStyles.inputLabel, { color: c.textSecondary }]}>
          Título do desafio
        </Text>
        <TextInput
          style={[
            dashStyles.input,
            {
              backgroundColor: c.surfaceElevated,
              color: c.text,
              borderColor: c.border,
            },
          ]}
          placeholder="Ex.: 100 flexões em 2 minutos"
          placeholderTextColor={c.textTertiary}
          value={chTitle}
          onChangeText={setChTitle}
        />
      </View>
      <View style={dashStyles.inputGroup}>
        <Text style={[dashStyles.inputLabel, { color: c.textSecondary }]}>
          Descrição
        </Text>
        <TextInput
          style={[
            dashStyles.input,
            dashStyles.inputMultiline,
            {
              backgroundColor: c.surfaceElevated,
              color: c.text,
              borderColor: c.border,
            },
          ]}
          placeholder="Detalhes do desafio..."
          placeholderTextColor={c.textTertiary}
          value={chDescription}
          onChangeText={setChDescription}
          multiline
          numberOfLines={3}
        />
      </View>
      <View style={dashStyles.inputGroup}>
        <Text style={[dashStyles.inputLabel, { color: c.textSecondary }]}>
          Recompensa se cumprir (coins)
        </Text>
        <TextInput
          style={[
            dashStyles.input,
            {
              backgroundColor: c.surfaceElevated,
              color: c.text,
              borderColor: c.border,
            },
          ]}
          placeholder="100"
          placeholderTextColor={c.textTertiary}
          value={chAmount}
          onChangeText={setChAmount}
          keyboardType="numeric"
        />
      </View>
      {renderDeadlinePicker()}
    </>
  );

  const renderActivityForm = () => (
    <>
      {renderGroupPicker()}
      <View style={dashStyles.inputGroup}>
        <Text style={[dashStyles.inputLabel, { color: c.textSecondary }]}>
          Descrição da atividade
        </Text>
        <TextInput
          style={[
            dashStyles.input,
            dashStyles.inputMultiline,
            {
              backgroundColor: c.surfaceElevated,
              color: c.text,
              borderColor: c.border,
            },
          ]}
          placeholder="O que você cumpriu?"
          placeholderTextColor={c.textTertiary}
          value={actDescription}
          onChangeText={setActDescription}
          multiline
          numberOfLines={4}
        />
      </View>
      <View style={localStyles.pickerSection}>
        <Text style={[localStyles.pickerLabel, { color: c.textSecondary }]}>
          Prova (foto ou vídeo)
        </Text>
        <Pressable
          onPress={pickActivityProof}
          style={[
            localStyles.attachRow,
            {
              backgroundColor: c.surfaceElevated,
              borderColor: c.border,
            },
          ]}
        >
          <Ionicons name="cloud-upload-outline" size={26} color={c.accent} />
          <View style={localStyles.attachTextBlock}>
            <Text style={[localStyles.attachTitle, { color: c.text }]}>
              {actProof ? actProof.fileName : 'Toque para escolher arquivo'}
            </Text>
            <Text style={[localStyles.attachHint, { color: c.textTertiary }]}>
              {actProof
                ? actProof.contentType
                : 'Necessário para publicar a atividade'}
            </Text>
          </View>
        </Pressable>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={dashStyles.modalOverlay}
      >
        <Pressable style={dashStyles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            localStyles.modalContentScroll,
            {
              backgroundColor: c.surface,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
              maxHeight: Dimensions.get('window').height * 0.88,
            },
          ]}
        >
          <View style={dashStyles.modalHandle} />

          {step === 'type' ? (
            <>
              <Text style={[dashStyles.modalTitle, { color: c.text }]}>
                O que você quer criar?
              </Text>
              <View style={localStyles.typeGrid}>
                <Pressable
                  onPress={() => handleSelectType('BET')}
                  style={[
                    localStyles.typeCard,
                    { borderColor: c.border, backgroundColor: c.surfaceElevated },
                  ]}
                >
                  <Ionicons name="trophy-outline" size={32} color={c.accent} />
                  <View style={localStyles.typeCardTextBlock}>
                    <Text style={[localStyles.typeCardTitle, { color: c.text }]}>
                      Aposta
                    </Text>
                    <Text
                      style={[
                        localStyles.typeCardSubtitle,
                        { color: c.textSecondary },
                      ]}
                    >
                      Desafio 1v1 com buy-in e votação da comunidade
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={c.textTertiary} />
                </Pressable>

                <Pressable
                  onPress={() => handleSelectType('CHALLENGE')}
                  style={[
                    localStyles.typeCard,
                    { borderColor: c.border, backgroundColor: c.surfaceElevated },
                  ]}
                >
                  <Ionicons name="flash-outline" size={32} color={c.accent} />
                  <View style={localStyles.typeCardTextBlock}>
                    <Text style={[localStyles.typeCardTitle, { color: c.text }]}>
                      Desafio
                    </Text>
                    <Text
                      style={[
                        localStyles.typeCardSubtitle,
                        { color: c.textSecondary },
                      ]}
                    >
                      Proposta unilateral com prazo e recompensa
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={c.textTertiary} />
                </Pressable>

                <Pressable
                  onPress={() => handleSelectType('ACTIVITY')}
                  style={[
                    localStyles.typeCard,
                    { borderColor: c.border, backgroundColor: c.surfaceElevated },
                  ]}
                >
                  <Ionicons name="images-outline" size={32} color={c.accent} />
                  <View style={localStyles.typeCardTextBlock}>
                    <Text style={[localStyles.typeCardTitle, { color: c.text }]}>
                      Atividade
                    </Text>
                    <Text
                      style={[
                        localStyles.typeCardSubtitle,
                        { color: c.textSecondary },
                      ]}
                    >
                      Poste uma conquista com prova em foto ou vídeo
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={c.textTertiary} />
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={localStyles.modalHeaderRow}>
                <Pressable
                  onPress={handleBackToTypes}
                  style={localStyles.backBtn}
                  hitSlop={8}
                >
                  <Ionicons name="arrow-back" size={22} color={c.accent} />
                  <Text style={[localStyles.backBtnText, { color: c.accent }]}>
                    Voltar
                  </Text>
                </Pressable>
                <Text
                  style={[dashStyles.modalTitle, { color: c.text, flex: 1, textAlign: 'center' }]}
                  numberOfLines={1}
                >
                  {formTitle}
                </Text>
                <View style={localStyles.headerSpacer} />
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                contentContainerStyle={localStyles.scrollInner}
              >
                {contentType === 'BET' ? renderBetForm() : null}
                {contentType === 'CHALLENGE' ? renderChallengeForm() : null}
                {contentType === 'ACTIVITY' ? renderActivityForm() : null}

                <Pressable
                  style={({ pressed }) => [
                    dashStyles.createSubmitBtn,
                    {
                      backgroundColor:
                        formValid && user && !isSubmitting ? c.accent : c.surfaceHighlight,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  onPress={() => {
                    void handleSubmit();
                  }}
                  disabled={!formValid || !user || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={formValid && user ? '#000' : c.textTertiary}
                    />
                  )}
                  <Text
                    style={[
                      dashStyles.createSubmitText,
                      {
                        color: formValid && user ? '#000' : c.textTertiary,
                      },
                    ]}
                  >
                    {isSubmitting ? 'Enviando…' : 'Continuar'}
                  </Text>
                </Pressable>
              </ScrollView>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
