import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.complementary.yellow.regular,
    borderRadius: UI_SIZES.radius.extraLarge,
    borderWidth: UI_SIZES.border.small,
    gap: UI_SIZES.spacing.medium,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.big,
  },
  text: {
    color: theme.palette.grey.black.toString(),
    textAlign: 'center',
  },
});
