import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.darkness,
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
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
