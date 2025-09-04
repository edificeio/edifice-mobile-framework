import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { baseStyles } from '~/framework/modules/communities/components/home-screen-tiles/styles';

const ICON_HEIGHT = UI_SIZES.elements.icon.default + 2 * UI_SIZES.spacing.minor;
const SMALL_BOLD_TEXT_HEIGHT = 2 * (TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale());
const SMALL_TEXT_HEIGHT = TextSizeStyle.Normal.lineHeight * PixelRatio.getFontScale();
const LOADER_CONTENT_HEIGHT = ICON_HEIGHT + SMALL_BOLD_TEXT_HEIGHT + SMALL_TEXT_HEIGHT + 2 * UI_SIZES.spacing.small;

export default StyleSheet.create({
  largeTileIcon: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.newCard,
    padding: UI_SIZES.spacing.minor,
  },
  tileCaptionDescriptionAvailable: {
    ...baseStyles.tileCaptionDescriptionAvailable,
  },
  tileCaptionTextAvailable: {
    ...baseStyles.tileCaptionTextAvailable,
  },
  tileDocuments: {
    ...baseStyles.tileBase,
    ...baseStyles.tileAvailable,
    justifyContent: 'space-between',
  },
  tileLoader: {
    borderRadius: UI_SIZES.radius.newCard,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: LOADER_CONTENT_HEIGHT,
    width: '100%',
  },
});
