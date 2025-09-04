import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const baseStyles = StyleSheet.create({
  tileBase: {
    alignItems: 'flex-start',
    borderRadius: UI_SIZES.radius.newCard,
    flex: 1,
    padding: UI_SIZES.spacing.small,
  },
  tileUnavailable: {
    backgroundColor: theme.palette.grey.pearl,
  },
});

const ICON_HEIGHT = UI_SIZES.elements.icon.small;
const SMALL_PILL_MARGIN = UI_SIZES.spacing.tiny / 2;
const SMALL_PILL_HEIGHT =
  PixelRatio.getFontScale() * TextSizeStyle.Small.lineHeight + UI_SIZES.spacing.tiny / 2 + SMALL_PILL_MARGIN;
const CONTENT_SPACING = UI_SIZES.spacing.minor;
const LOADER_HEIGHT = ICON_HEIGHT + SMALL_PILL_HEIGHT + CONTENT_SPACING + 2 * (UI_SIZES.spacing.small + UI_SIZES.border.small);

export default StyleSheet.create({
  tileCaption: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  tileCaptionTextUnavailable: {
    color: theme.palette.grey.graphite,
  },
  tileCourses: {
    ...baseStyles.tileBase,
    ...baseStyles.tileUnavailable,
    gap: UI_SIZES.spacing.minor,
  },
  tileLoader: {
    borderRadius: UI_SIZES.radius.newCard,
    height: LOADER_HEIGHT,
    width: '100%',
  },
});
