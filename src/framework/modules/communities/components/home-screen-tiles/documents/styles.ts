import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const baseStyles = StyleSheet.create({
  tileAvailable: {
    backgroundColor: theme.palette.primary.pale,
  },
  tileBase: {
    alignItems: 'flex-start',
    borderRadius: UI_SIZES.radius.newCard,
    flex: 1,
    padding: UI_SIZES.spacing.small,
  },
});

const CONTENT_SPACING = 2 * getScaleWidth(15);
const ICON_HEIGHT = UI_SIZES.elements.icon.default + 2 * UI_SIZES.spacing.minor;
const SMALL_BOLD_TEXT_HEIGHT = 2 * (TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale());
const SMALL_TEXT_HEIGHT = TextSizeStyle.Normal.lineHeight * PixelRatio.getFontScale();
const LOADER_CONTENT_HEIGHT =
  ICON_HEIGHT + SMALL_BOLD_TEXT_HEIGHT + SMALL_TEXT_HEIGHT + 2 * (UI_SIZES.spacing.small + UI_SIZES.border.small) + CONTENT_SPACING;

export default StyleSheet.create({
  largeTileIcon: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.newCard,
    padding: UI_SIZES.spacing.minor,
  },
  tileCaptionDescriptionAvailable: {
    color: theme.palette.grey.graphite,
  },
  tileCaptionTextAvailable: {
    color: theme.palette.primary.regular,
  },
  tileDocuments: {
    ...baseStyles.tileBase,
    ...baseStyles.tileAvailable,
    justifyContent: 'space-between',
  },
  tileLoader: {
    borderRadius: UI_SIZES.radius.newCard,
    height: LOADER_CONTENT_HEIGHT,
    width: '100%',
  },
});
