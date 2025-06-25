import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  emptyPage: { backgroundColor: undefined, paddingTop: 0 },
  linePlaceholder: {
    borderRadius: UI_SIZES.radius.card,
    marginBottom: UI_SIZES.spacing.minor,
  },
  listContainerPlaceholder: {
    marginHorizontal: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.large,
  },
  listContentPlaceholder: {
    marginTop: UI_SIZES.spacing.medium,
  },
  newPageButton: {
    alignSelf: 'baseline',
    marginBottom: UI_SIZES.spacing.big,
    marginLeft: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.minor,
  },
  page: {
    backgroundColor: theme.ui.background.card,
  },
  pageListTitle: {
    marginBottom: UI_SIZES.spacing.medium,
    marginHorizontal: UI_SIZES.spacing.big,
  },
  titlePlaceholder: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.card,
    width: getScaleWidth(210),
  },
});
