import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  back: {
    alignContent: 'flex-end',
    backgroundColor: theme.palette.grey.darkness,
    justifyContent: 'flex-end',
    left: 0,
    opacity: 0.6,
    paddingBottom: UI_SIZES.spacing.medium,
    paddingLeft: UI_SIZES.spacing.medium,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9999999,
  },
  overlayLandscape: {
    height: 36,
  },
  overlayPortrait: {
    height: UI_SIZES.screen.topInset + UI_SIZES.elements.navbarHeight,
  },
  page: {
    backgroundColor: theme.palette.grey.darkness,
  },
  playerLandscape: {
    backgroundColor: theme.palette.grey.darkness,
    height: UI_SIZES.screen.width,
    width: UI_SIZES.screen.height,
    marginTop: 36,
  },
  playerPortrait: {
    backgroundColor: theme.palette.grey.darkness,
    height: UI_SIZES.screen.height,
    marginBottom: UI_SIZES.screen.bottomInset,
    marginTop: UI_SIZES.screen.topInset + UI_SIZES.elements.navbarHeight,
    width: UI_SIZES.screen.width,
  },
  errorScreen: {
    backgroundColor: 'transparent',
    height: UI_SIZES.screen.height,
    justifyContent: 'center',
  },
});
