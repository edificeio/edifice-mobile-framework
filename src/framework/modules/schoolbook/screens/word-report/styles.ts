import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  acknowledgedBy: { color: theme.palette.grey.graphite },
  acknowledgedStudentContainer: {
    paddingVertical: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    borderBottomColor: theme.palette.grey.cloudy,
  },
  acknowledgedStudentInfos: { flex: 1, marginLeft: UI_SIZES.spacing.minor },
  acknowledgedStudentSubContainer: { flexDirection: 'row' },
  acknowledgedStudentsContentContainer: { backgroundColor: theme.ui.background.card, borderRadius: UI_SIZES.radius.medium },
  acknowledgementsText: { marginTop: UI_SIZES.spacing.minor },
  acknowledgementsTitle: { marginTop: UI_SIZES.spacing.tiny },
  borderBottomWidthOne: { borderBottomWidth: 1 },
  borderBottomWidthZero: { borderBottomWidth: 0 },
  list: {
    marginTop: UI_SIZES.spacing.small,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'visible',
    backgroundColor: theme.ui.background.page,
    borderRadius: UI_SIZES.radius.medium,
  },
  marginBottomZero: { marginBottom: 0 },
  marginBottomTiny: { marginBottom: UI_SIZES.spacing.tiny },
  modalBoxButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: UI_SIZES.spacing.large },
  modalBoxCancel: { marginRight: UI_SIZES.spacing.big, color: theme.palette.grey.graphite },
  modalBoxText: { marginTop: UI_SIZES.spacing.small },
  responseContainer: {
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 1,
    borderColor: theme.palette.grey.cloudy,
    padding: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.tiny,
  },
  responseDate: { marginLeft: UI_SIZES.spacing.minor, color: theme.palette.grey.graphite },
  responseInfos: { flexDirection: 'row' },
  responseInfosContainer: { flex: 1, marginLeft: UI_SIZES.spacing.minor },
  responseParentName: { flexShrink: 1 },
  responseSubContainer: { flexDirection: 'row' },
  unacknowledgementsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unacknowledgementsText: { marginTop: UI_SIZES.spacing.minor },
  userListContainer: { backgroundColor: theme.ui.background.card, borderRadius: UI_SIZES.radius.medium },
  userListItem: { marginBottom: undefined, paddingVertical: UI_SIZES.spacing.small, paddingHorizontal: UI_SIZES.spacing.medium },
});
