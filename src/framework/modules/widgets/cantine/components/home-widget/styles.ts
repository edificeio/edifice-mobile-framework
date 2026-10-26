import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { CANTINE_WIDGET_FADE_HEIGHT, CANTINE_WIDGET_MENU_MAX_HEIGHT } from '~/framework/modules/widgets/components/constants';

const CARD_BACKGROUND = String(theme.palette.grey.white);

export default StyleSheet.create({
  fade: {
    bottom: 0,
    experimental_backgroundImage: `linear-gradient(to bottom, ${CARD_BACKGROUND}00, ${CARD_BACKGROUND})`,
    height: CANTINE_WIDGET_FADE_HEIGHT,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
  },
  menu: {
    maxHeight: CANTINE_WIDGET_MENU_MAX_HEIGHT,
    overflow: 'hidden',
  },
  // the height a long menu is cut at, which the steps overflow, so that the card keeps its size.
  placeholder: {
    height: CANTINE_WIDGET_MENU_MAX_HEIGHT,
    overflow: 'hidden',
  },

  placeholderContent: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
    paddingBottom: UI_SIZES.spacing.medium,
  },

  placeholderDish: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: TextSizeStyle.Medium.lineHeight,
  },

  placeholderDot: {
    height: UI_SIZES.elements.icon.mediumlarge,
    width: UI_SIZES.elements.icon.mediumlarge,
  },

  placeholderLabel: {
    height: UI_SIZES.elements.icon.xsmall,
    width: UI_SIZES.elements.icon.xsmall,
  },

  // As in the stepper, the line runs down to the next dot, so the gap between two steps lives in the content.
  placeholderLine: {
    borderRadius: 0,
    flex: 1,
    width: UI_SIZES.border.small,
  },
  placeholderStep: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  // Centred on the dot, as the step title is.
  placeholderTitle: {
    height: UI_SIZES.elements.icon.xsmall,
    marginVertical: (UI_SIZES.elements.icon.mediumlarge - UI_SIZES.elements.icon.xsmall) / 2,
  },
  placeholderTrack: {
    alignItems: 'center',
  },
  seeMore: {
    alignSelf: 'center',
  },
  structureName: {
    color: theme.palette.grey.graphite,
  },
});
