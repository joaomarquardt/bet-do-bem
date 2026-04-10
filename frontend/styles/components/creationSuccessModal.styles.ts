import { StyleSheet } from 'react-native';

export const creationSuccessModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 26,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
  },
  iconWrap: {
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  okBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  okBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});
