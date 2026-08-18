import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const fontScale = PixelRatio.getFontScale();

export const TITLE_PLACEHOLDER_HEIGHT = TextSizeStyle.Big.lineHeight * fontScale;
export const LINE_PLACEHOLDER_HEIGHT = TextSizeStyle.Medium.lineHeight * fontScale;
const BUTTON_PLACEHOLDER_HEIGHT = TextSizeStyle.Normal.lineHeight * fontScale + 2 * UI_SIZES.spacing.tiny;

const linePlaceholderBaseStyle = {
  backgroundColor: theme.palette.grey.pearl,
  borderRadius: UI_SIZES.radius.medium,
};

export const loaderStyles = StyleSheet.create({
  buttonPlaceholder: {
    alignSelf: 'center',
    borderRadius: UI_SIZES.radius.big,
    height: BUTTON_PLACEHOLDER_HEIGHT,
    width: getScaleWidth(136),
  },
  illustration: {
    alignSelf: 'center',
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.mediumPlus,
    height: getScaleWidth(80),
    marginBottom: UI_SIZES.spacing.medium,
    width: getScaleWidth(150),
  },
  linePlaceholder: {
    ...linePlaceholderBaseStyle,
    width: getScaleWidth(279),
  },
  shortLinePlaceholder: {
    ...linePlaceholderBaseStyle,
    width: getScaleWidth(176),
  },
  titlePlaceholder: {
    ...linePlaceholderBaseStyle,
    width: getScaleWidth(217),
  },
});
