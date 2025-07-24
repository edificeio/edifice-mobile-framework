import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.complementary.red.regular,
    borderRadius: UI_SIZES.radius.extraLarge,
    elevation: 10,
    height: getScaleWidth(28),
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.minor,
    position: 'absolute',
    right: UI_SIZES.spacing.minor,
    top: UI_SIZES.spacing.minor,
    zIndex: 10,
  },
  badgeText: {
    color: theme.palette.grey.white,
  },
});
