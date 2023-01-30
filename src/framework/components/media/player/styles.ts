import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.darkness,
    position: 'relative',
  },
  back: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: 'rgba(0,0,0,.6)',
    zIndex: 9999999,
    paddingBottom: UI_SIZES.spacing.medium,
    paddingLeft: UI_SIZES.spacing.medium,
    alignContent: 'flex-end',
    justifyContent: 'flex-end',
  },
  playerLandscape: {
    backgroundColor: theme.palette.grey.darkness,
    height: UI_SIZES.screen.width,
    width: UI_SIZES.screen.height,
  },
  playerPortrait: {
    backgroundColor: theme.palette.grey.darkness,
    height: UI_SIZES.screen.height,
    marginBottom: UI_SIZES.screen.bottomInset,
    marginTop: UI_SIZES.screen.topInset,
    width: UI_SIZES.screen.width,
  },
});
