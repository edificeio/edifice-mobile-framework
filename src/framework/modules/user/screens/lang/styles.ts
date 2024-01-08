import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    padding: UI_SIZES.spacing.big,
    backgroundColor: theme.palette.grey.white,
  },
  title: {
    color: theme.palette.primary.regular,
  },
  text: {
    marginVertical: UI_SIZES.spacing.medium,
  },
});
