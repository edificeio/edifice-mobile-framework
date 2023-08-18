import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  listHeaderContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.spacing.big,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.cloudy,
  },
  pageContainerStyle: {
    backgroundColor: theme.palette.grey.white,
  },
  validateButton: {
    margin: UI_SIZES.spacing.medium,
  },
});
