import { StyleSheet } from 'react-native';
import theme from '~/app/theme';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomForm: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  editor: {
    minHeight: '20%',
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
  },
});
