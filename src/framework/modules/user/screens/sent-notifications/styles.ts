import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  infoBody: {
    gap: UI_SIZES.spacing.major,
    paddingBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  infoHandle: {
    backgroundColor: theme.palette.grey.grey,
  },
  infoHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  infoTitle: {
    textAlign: 'center',
  },
});
