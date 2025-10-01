import { PixelRatio, StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const AUTHOR_NAME_LOADER_HEIGHT = TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale();
const AUDIENCE_BTN_LOADER_HEIGHT = TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale() + 2 * UI_SIZES.spacing.tiny;
const MEDIA_TILE_WIDTH = '48.7%';

const textLineBase = {
  borderRadius: UI_SIZES.radius.card,
  height: AUTHOR_NAME_LOADER_HEIGHT,
};

export default StyleSheet.create({
  audienceButton: {
    borderRadius: UI_SIZES.radius.card,
    height: AUDIENCE_BTN_LOADER_HEIGHT,
    width: getScaleWidth(91),
  },
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  authorName: {
    ...textLineBase,
    width: getScaleWidth(232),
  },
  avatar: {
    height: UI_SIZES.elements.avatar.md,
    width: UI_SIZES.elements.avatar.md,
  },
  container: {
    flexDirection: 'column',
    gap: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.big,
    position: 'relative',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: UI_SIZES.spacing.minor,
  },
  mediaTile: {
    borderRadius: UI_SIZES.radius.small,
    flexBasis: MEDIA_TILE_WIDTH,
    height: getScaleWidth(113),
  },
  // for next version : options button for community action
  // optionsButton: {
  //   borderRadius: UI_SIZES.radius.card,
  //   height: UI_SIZES.elements.icon.xlarge,
  //   position: 'absolute',
  //   right: -UI_SIZES.spacing.medium,
  //   top: -UI_SIZES.spacing.medium,
  //   width: UI_SIZES.elements.icon.xlarge,
  // },
  textContentContainer: {
    gap: UI_SIZES.spacing.tiny,
  },
  textContentLineLong: {
    ...textLineBase,
    width: getScaleWidth(327),
  },
  textContentLineShort: {
    ...textLineBase,
    width: getScaleWidth(162),
  },
});
