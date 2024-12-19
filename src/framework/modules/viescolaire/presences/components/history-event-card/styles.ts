import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.card,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  contentContainer: {
    flexShrink: 1,
    padding: UI_SIZES.spacing.minor,
  },
});
