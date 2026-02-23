import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});
