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
  cardContainer: {
    alignSelf: 'center',
    borderRadius: UI_SIZES.radius.mediumPlus,
    flexDirection: 'column',
    height: UI_SIZES.elements.communities.cardSmallHeight,
    overflow: 'hidden',
    position: 'relative',
    width: UI_SIZES.elements.communities.cardSmallWidth,
  },
  imgContainer: {
    // give a border radius to override the one from ModuleImage
    borderRadius: 0,
    height: getScaleWidth(80),
  },
  titleContainer: {
    backgroundColor: theme.palette.grey.white,
    height: getScaleWidth(48),
    padding: UI_SIZES.spacing.small,
  },
});
