import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  view: {
    padding: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.huge,
    backgroundColor: theme.palette.primary.pale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmark: {
    backgroundColor: theme.palette.complementary.yellow.pale,
  },
});
