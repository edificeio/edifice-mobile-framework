import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const POPOVER_ICON_SIZE = getScaleWidth(24);
export const POPOVER_MIN_WIDTH = getScaleWidth(220);
export const POPOVER_SCREEN_MARGIN = UI_SIZES.spacing.small;
export const POPOVER_ANCHOR_GAP = UI_SIZES.spacing.tiny;
export const POPOVER_BOTTOM_SPACE = UI_SIZES.elements.tabbarHeight + UI_SIZES.screen.bottomInset + UI_SIZES.spacing.small;

export default StyleSheet.create({
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  actionTitle: {
    flexShrink: 1,
  },
  actionTitleDestructive: {
    color: theme.palette.status.failure.regular.toString(),
  },
  card: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    elevation: 8,
    maxWidth: UI_SIZES.screen.width - 2 * POPOVER_SCREEN_MARGIN,
    paddingVertical: UI_SIZES.spacing.minor,
    position: 'absolute',
    shadowColor: theme.palette.grey.black.toString(),
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  dimmed: {
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
  },
});
