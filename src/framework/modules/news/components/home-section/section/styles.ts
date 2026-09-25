import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    gap: UI_SIZES.spacing.minor,
  },
  title: {
    color: theme.palette.grey.black.toString(),
    flexShrink: 1,
  },
});
