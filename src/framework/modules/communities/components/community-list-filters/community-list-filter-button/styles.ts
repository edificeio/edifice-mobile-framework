import { PixelRatio, StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const LOADER_HEIGHT =
  TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale() + UI_SIZES.spacing.minor * 2 + UI_SIZES.spacing.tiny * 2;

const LOADER_WIDTH = getScaleWidth(114);

const styles = StyleSheet.create({
  badge: {
    marginLeft: UI_SIZES.spacing.tiny,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  loaderContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 2,
    justifyContent: 'center',
    minWidth: LOADER_WIDTH,
  },
  loaderContent: {
    borderRadius: UI_SIZES.radius.input,
    height: LOADER_HEIGHT,
  },
});

export default styles;
