import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  absenceActionContainer: {
    marginBottom: UI_SIZES.spacing.big,
  },
  childListContainer: {
    borderBottomWidth: UI_SIZES.border.thin,
    borderBottomColor: theme.palette.grey.cloudy,
  },
  childListContentContainer: {
    padding: UI_SIZES.spacing.medium,
  },
  childListItemContainer: {
    paddingBottom: UI_SIZES.spacing.minor, // fix to UserList item auto sizing being wrong
  },
  detailsActionContainer: {
    alignSelf: 'flex-end',
  },
  emptyScreenContainer: {
    paddingTop: 0,
    backgroundColor: theme.palette.grey.white,
  },
  emptyScreenTitle: {
    marginTop: UI_SIZES.spacing.small,
  },
  informationText: {
    marginTop: UI_SIZES.spacing.tiny,
    marginBottom: UI_SIZES.spacing.minor,
    color: theme.ui.text.light,
  },
  listContentContainer: {
    rowGap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.spacing.big,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
});
