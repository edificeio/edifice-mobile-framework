import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
  },
  container: {
    rowGap: UI_SIZES.spacing.big,
    padding: UI_SIZES.spacing.medium,
  },
  filePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconAttMarginRight: {
    marginRight: UI_SIZES.spacing.minor,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
});
