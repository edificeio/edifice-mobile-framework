import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const LOADER_HEIGHT = TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale();

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  loaderContent: {
    alignSelf: 'center',
    borderRadius: UI_SIZES.radius.small,
    height: LOADER_HEIGHT,
    width: getScaleWidth(101),
  },
});
