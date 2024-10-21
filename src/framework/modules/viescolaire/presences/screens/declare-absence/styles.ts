import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  childInfoContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
  },
  container: {
    padding: UI_SIZES.spacing.medium,
    rowGap: UI_SIZES.spacing.big,
  },
  filePickerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconAttMarginRight: {
    marginRight: UI_SIZES.spacing.minor,
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
});
