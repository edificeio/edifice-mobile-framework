import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  allergens: {
    color: theme.palette.cantine.allergens,
  },
  details: {
    flex: 1,
  },
  labels: {
    justifyContent: 'center',
    minHeight: TextSizeStyle.Medium.lineHeight,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
});
