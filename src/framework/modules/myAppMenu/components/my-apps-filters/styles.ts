import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.grey.fog,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  list: {
    flexGrow: 0,
    flexShrink: 0,
  },

  selectedButton: {
    backgroundColor: theme.palette.primary.regular,
    borderWidth: 0,
  },

  selectedText: {
    color: theme.palette.primary.regular,
  },

  unselectedButton: {
    // backgroundColor: 'none',
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },

  unselectedText: {
    color: theme.palette.primary.regular,
  },
});
