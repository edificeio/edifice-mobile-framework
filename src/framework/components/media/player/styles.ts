import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  errorScreen: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingTop: 0,
  },

  externalPlayerPortrait: { marginTop: 0 },

  page: {
    backgroundColor: theme.palette.grey.darkness,
  },

  playerLandscape: {
    backgroundColor: theme.palette.grey.darkness,
    height: UI_SIZES.screen.width,
    width: UI_SIZES.screen.height,
  },

  playerPortrait: {
    backgroundColor: theme.palette.grey.darkness,
    height: UI_SIZES.screen.height - UI_SIZES.screen.topInset - UI_SIZES.screen.bottomInset,
    marginBottom: UI_SIZES.screen.bottomInset,
    marginTop: UI_SIZES.screen.topInset,
    width: UI_SIZES.screen.width,
  },
  poster: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
