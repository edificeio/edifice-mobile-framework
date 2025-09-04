import { PixelRatio, StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const LOADER_HEIGHT = PixelRatio.getFontScale() * TextSizeStyle.Medium.lineHeight;

const LOADER_TITLE = {
  borderRadius: UI_SIZES.radius.medium,
  height: LOADER_HEIGHT,
};

export default StyleSheet.create({
  loaderBanner: {
    borderBottomLeftRadius: UI_SIZES.radius.extraLarge,
    borderBottomRightRadius: UI_SIZES.radius.extraLarge,
    overflow: 'hidden',
    width: UI_SIZES.screen.width,
  },
  loaderEmptyBigLine: {
    borderRadius: UI_SIZES.radius.medium,
    height: getScaleWidth(24),
    width: getScaleWidth(279),
  },
  loaderEmptyImage: {
    borderRadius: UI_SIZES.radius.newCard,
    height: getScaleWidth(143),
    width: getScaleWidth(250),
  },
  loaderEmptyScreen: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.medium,
  },
  loaderEmptyScreenLines: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.tiny,
  },
  loaderEmptySmallLine: {
    borderRadius: UI_SIZES.radius.small,
    height: getScaleWidth(20),
    width: getScaleWidth(237),
  },
  loaderPage: {
    gap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  loaderSectionTitle: {
    ...LOADER_TITLE,
    width: '70%',
  },
  loaderSectionTitleShort: {
    ...LOADER_TITLE,
    width: '30%',
  },
  page: {
    gap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  tilesCol: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
  },
  tilesRow: {
    flex: 1,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
});
