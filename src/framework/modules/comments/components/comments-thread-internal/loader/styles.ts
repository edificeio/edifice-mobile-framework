import { PixelRatio, StyleSheet } from 'react-native';

import { AvatarSizes } from '~/framework/components/avatar/styles';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export const LOADER_ITEM_AVATAR_SIZE = AvatarSizes.xsm + UI_SIZES.border.small * 2;
export const LOADER_FORM_AVATAR_SIZE = AvatarSizes.md + UI_SIZES.border.small * 2;

const FONT_SCALE = PixelRatio.getFontScale();
const LOADER_TEXT_LINE_HEIGHT = TextSizeStyle.Normal.lineHeight * FONT_SCALE;

export default StyleSheet.create({
  loaderFormInput: {
    borderRadius: UI_SIZES.radius.input,
    flex: 1,
    height: LOADER_FORM_AVATAR_SIZE,
  },
  loaderFormRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  loaderItemAction: {
    borderRadius: UI_SIZES.radius.extraLarge,
    height: LOADER_TEXT_LINE_HEIGHT,
  },
  loaderItemActionLong: {
    width: getScaleWidth(74) * FONT_SCALE,
  },
  loaderItemActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    minHeight: LOADER_TEXT_LINE_HEIGHT + UI_SIZES.spacing.tiny * 2,
  },
  loaderItemActionShort: {
    width: getScaleWidth(61) * FONT_SCALE,
  },
  loaderItemAuthor: {
    borderRadius: UI_SIZES.radius.card,
    height: LOADER_TEXT_LINE_HEIGHT,
  },
  loaderItemContent: {
    borderRadius: UI_SIZES.radius.medium,
    height: LOADER_TEXT_LINE_HEIGHT + UI_SIZES.spacing.minor * 2,
    width: '100%',
  },
});
