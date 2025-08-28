import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bookmark: {
    backgroundColor: theme.palette.complementary.yellow.pale,
  },
  noUser: {
    backgroundColor: theme.palette.status.warning.pale,
  },
  view: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.huge,
    justifyContent: 'center',
  },
});
