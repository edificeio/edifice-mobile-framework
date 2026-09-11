import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
  },
  name: {
    flexShrink: 1,
  },
  profile: {
    flexShrink: 0,
  },
  separator: {
    color: theme.palette.grey.black,
    flexShrink: 0,
  },
});
