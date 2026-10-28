import { PixelRatio, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { COLLAPSIBLE_SMALL_HEIGHT } from '~/framework/modules/communities/components/discussions/header/styles';

export const SCROLL_INDICATOR_INSETS = { top: COLLAPSIBLE_SMALL_HEIGHT };

export default StyleSheet.create({
  firstMessage: {
    paddingBottom: UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.large,
  },
  firstMessageLoader: {
    gap: UI_SIZES.spacing.tiny,
    paddingBottom: UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.large,
  },
  firstMessageLoaderLine: {
    borderRadius: UI_SIZES.radius.card,
    height: TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale(),
  },
  listFooterLoader: {
    alignItems: 'center',
    paddingVertical: UI_SIZES.spacing.medium,
  },
  loaderContent: { flex: 1, overflow: 'hidden' },
  /** Covers the content (and the header overlay) until it is laid out. */
  loaderRoot: { backgroundColor: theme.ui.background.card, bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, zIndex: 2 },
  root: { flex: 1 },
});
