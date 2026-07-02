import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  participantHandle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  titleContainer: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  detailsContainer: {
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  acceptBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
