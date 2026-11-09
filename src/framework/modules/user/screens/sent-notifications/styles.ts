import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  infoBody: {
    gap: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  infoHandle: {
    backgroundColor: theme.palette.grey.grey,
  },
  infoHeader: {
    alignItems: 'flex-end',
    paddingBottom: UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.minor,
  },
  infoTitle: {
    textAlign: 'center',
  },
});
