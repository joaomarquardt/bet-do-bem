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
  challengeProofContainer: {
    marginTop: 8,
    gap: 8,
  },
  challengeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  challengeHeaderColumn: {
    flex: 1,
  },
  challengeHeaderLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  challengeHeaderValue: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  activityProofContainer: {
    marginTop: 8,
  },
  proofsMediaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  proofMediaWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  proofMediaWrapperSingle: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  proofMediaImage: {
    width: '100%',
    height: 160,
  },
  proofOwnerChip: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  proofOwnerText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  proofMediaOverlay: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    padding: 6,
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
  commentsWrapper: {
    marginHorizontal: -14,
    marginBottom: -14,
    marginTop: 4,
  },
  awaitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 4,
  },
  awaitingText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});

