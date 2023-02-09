import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  studentInfos: {
    padding: UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.medium,
  },
  studentName: {
    marginBottom: UI_SIZES.spacing.small,
  },
  studentGroups: {
    marginTop: -UI_SIZES.spacing.tiny,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: UI_SIZES.spacing.small,
  },
  iconDisplay: {
    marginRight: UI_SIZES.spacing.small,
    marginTop: -UI_SIZES.spacing.tiny,
  },
  relativesInfos: {
    flex: 1,
    borderStyle: 'solid',
    padding: UI_SIZES.spacing.small,
  },
  relativesTitleText: {
    marginBottom: UI_SIZES.spacing.small,
  },
  relativesContainer: {
    marginBottom: UI_SIZES.spacing.big,
  },
  relativesIdentity: {
    marginBottom: UI_SIZES.spacing.tiny,
  },
  shadow: {
    backgroundColor: theme.palette.grey.white,
    elevation: 4,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
});
