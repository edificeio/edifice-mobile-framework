import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export const BANNER_BASE_HEIGHT = UI_SIZES.screen.width / UI_SIZES.aspectRatios.banner;

export default StyleSheet.create({
  banner: {
    borderBottomLeftRadius: UI_SIZES.radius.extraLarge,
    borderBottomRightRadius: UI_SIZES.radius.extraLarge,
    overflow: 'hidden',
    width: UI_SIZES.screen.width,
  },
});
