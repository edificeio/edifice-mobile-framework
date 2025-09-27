import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomSheetListContainer: {
    backgroundColor: theme.palette.grey.white,
    flex: 1,
  },
  listContainer: {
    backgroundColor: theme.palette.grey.white,
    flex: 1,
  },
  spacingItem: {
    height: UI_SIZES.spacing.tiny,
  },
});
