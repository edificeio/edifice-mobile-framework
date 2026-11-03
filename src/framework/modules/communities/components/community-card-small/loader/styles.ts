import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const fontScale = PixelRatio.getFontScale();

// same height as the real card image (styles.imgContainer)
const IMAGE_HEIGHT = getScaleWidth(80);
// BodyBoldText uses TextSizeStyle.Medium
const TITLE_HEIGHT = TextSizeStyle.Medium.lineHeight * fontScale;

export default StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    marginHorizontal: UI_SIZES.spacing.big,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 0,
    height: IMAGE_HEIGHT,
    width: '100%',
  },
  title: {
    borderRadius: UI_SIZES.radius.small,
    height: TITLE_HEIGHT,
    width: '60%',
  },
  titleContainer: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.small,
  },
});
