import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  buyInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  buyInText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  pendingMetadataList: {
    gap: 5,
    marginTop: -1,
  },
  pendingMetadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingMetadataKey: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  pendingMetadataValue: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  pendingDescriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 1,
  },
  pendingDescriptionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vsLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  opponentName: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  deadline: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
