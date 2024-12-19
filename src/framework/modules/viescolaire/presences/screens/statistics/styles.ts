import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  dropdownContainer: {
    zIndex: 10,
  },
  dropdownMargin: {
    marginBottom: UI_SIZES.spacing.small,
  },
  listContentContainer: {
    padding: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.spacing.medium + UI_SIZES.screen.bottomInset,
    rowGap: UI_SIZES.spacing.small,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
});
