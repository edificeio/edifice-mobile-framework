import theme from '~/app/theme';
import { getScaleWidth } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

export const COLLAPSED_LINES = 2;

export const ARC_WIDTH = getScaleWidth(81);
export const ARC_HEIGHT = getScaleWidth(140);
export const ICON_SIZE = getScaleWidth(20);
export const ICON_WRAPPER_SIZE = getScaleWidth(28);

export const HTML_OPTIONS = {
  audio: false,
  // Bold is one formatting among others, as the spec lists it: same font and same size as the body.
  boldTextStyle: { ...TextFontStyle.Bold, ...TextSizeStyle.Normal, color: theme.palette.grey.darkness },
  globalTextStyle: { ...TextFontStyle.Regular, ...TextSizeStyle.Normal, color: theme.palette.grey.darkness },
  iframes: false,
  images: false,
  linkTextStyle: { color: theme.palette.complementary.blue.regular, textDecorationLine: 'underline' as const },
  textColor: false,
  video: false,
};
