import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.medium,
  },
  inputContainer: {
    marginBottom: UI_SIZES.spacing.medium,
  },
});
