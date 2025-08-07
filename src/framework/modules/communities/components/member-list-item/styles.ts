import { PixelRatio, StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const LOADER_HEIGHT = TextSizeStyle.Normal.lineHeight * PixelRatio.getFontScale();
const LOADER_WIDTH = getScaleWidth(208);
const LOADER_HEIGHT_SECOND_LINE = LOADER_HEIGHT * 0.64; // = ratio from figma components
const LOADER_WIDTH_SECOND_LINE = getScaleWidth(130);

export default StyleSheet.create({
  container: { alignItems: 'flex-start', flexDirection: 'column' },
  containerText: { alignItems: 'center', flexDirection: 'row' },
  loaderFirstLine: {
    borderRadius: UI_SIZES.radius.small,
    height: LOADER_HEIGHT,
    width: LOADER_WIDTH,
  },
  loaderSecondLine: {
    borderRadius: UI_SIZES.radius.small,
    height: LOADER_HEIGHT_SECOND_LINE,
    marginTop: UI_SIZES.spacing.minor,
    width: LOADER_WIDTH_SECOND_LINE,
  },
  separator: { marginHorizontal: UI_SIZES.spacing.tiny },
});
