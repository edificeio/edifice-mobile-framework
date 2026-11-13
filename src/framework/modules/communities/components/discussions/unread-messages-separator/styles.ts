import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  line: {
    backgroundColor: theme.palette.status.failure.regular,
    flex: 1,
    height: UI_SIZES.border.thin,
  },
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  text: { color: theme.palette.status.failure.regular },
});
