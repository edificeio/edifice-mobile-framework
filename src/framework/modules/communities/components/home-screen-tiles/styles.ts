import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const ICON_HEIGHT = UI_SIZES.elements.icon.small;
const SMALL_PILL_MARGIN = UI_SIZES.spacing.tiny / 2;
const SMALL_PILL_HEIGHT =
  PixelRatio.getFontScale() * TextSizeStyle.Small.lineHeight + UI_SIZES.spacing.tiny / 2 + SMALL_PILL_MARGIN;
const CONTENT_SPACING = UI_SIZES.spacing.minor;
const TILE_UNAVAILABLE_LOADER_HEIGHT = ICON_HEIGHT + SMALL_PILL_HEIGHT + CONTENT_SPACING + 2 * UI_SIZES.spacing.small;

export const baseStyles = StyleSheet.create({
  tileAvailable: {
    backgroundColor: theme.palette.primary.pale,
  },
  tileBase: {
    alignItems: 'flex-start',
    borderRadius: UI_SIZES.radius.newCard,
    flex: 1,
    padding: UI_SIZES.spacing.small,
  },
  tileCaption: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  tileCaptionDescriptionAvailable: {
    color: theme.palette.grey.graphite,
  },
  tileCaptionTextAvailable: {
    color: theme.palette.primary.regular,
  },
  tileCaptionTextUnavailable: {
    color: theme.palette.grey.graphite,
  },
  tileUnavailable: {
    backgroundColor: theme.palette.grey.pearl,
    gap: UI_SIZES.spacing.minor,
  },
  tileUnavailableLoader: {
    borderRadius: UI_SIZES.radius.newCard,
    height: TILE_UNAVAILABLE_LOADER_HEIGHT,
    width: '100%',
  },
});
