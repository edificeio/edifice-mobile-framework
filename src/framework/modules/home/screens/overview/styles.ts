import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  content: {
    backgroundColor: theme.ui.background.page,
    flexDirection: 'column',
    gap: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.spacing.big,
  },
  widgets: {
    gap: UI_SIZES.spacing.minor,
  },
});
