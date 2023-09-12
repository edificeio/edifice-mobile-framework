import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.ui.background.card,
    borderWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.card,
    overflow: 'hidden',
  },
  contentContainer: {
    flexShrink: 1,
    padding: UI_SIZES.spacing.minor,
  },
  iconContainer: {
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
  },
});
