import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const INACTIVE_ITEM_WIDTH = UI_SIZES.elements.icon.small;
const ACTIVE_ITEM_HEIGHT = UI_SIZES.elements.icon.xlarge + UI_SIZES.elements.icon.xxsmall;
export const ACTIVE_ITEM_WIDTH = UI_SIZES.elements.icon.small * 2;
export const ITEM_GAP = UI_SIZES.spacing.minor;
export const PAGINATION_COMPONENT_HEIGHT = ACTIVE_ITEM_HEIGHT + UI_SIZES.spacing.minor * 2; // 64 + 16 = 80
export const SCREEN_HEIGHT = UI_SIZES.screen.height;
export const SCREEN_WIDTH = UI_SIZES.screen.width;

const styles = StyleSheet.create({
  carouselContainer: { flex: 1 },
  container: { backgroundColor: theme.palette.grey.darkness, flex: 1, flexDirection: 'column' },
  paginationActiveDot: {
    backgroundColor: theme.palette.grey.darkness as string,
    borderRadius: UI_SIZES.radius.small,
    height: ACTIVE_ITEM_HEIGHT,
    overflow: 'hidden',
    width: ACTIVE_ITEM_WIDTH,
  },
  paginationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: ITEM_GAP,
    height: PAGINATION_COMPONENT_HEIGHT,
    justifyContent: 'flex-start',
    width: '100%',
  },
  paginationDot: {
    backgroundColor: theme.palette.grey.darkness as string,
    borderRadius: UI_SIZES.radius.small,
    height: UI_SIZES.elements.icon.mediumlarge,
    overflow: 'hidden',
    width: INACTIVE_ITEM_WIDTH,
  },
  paginationGradient: {
    bottom: 0,
    height: PAGINATION_COMPONENT_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  paginationGradientSvg: {
    height: PAGINATION_COMPONENT_HEIGHT,
    position: 'absolute',
    width: '100%',
  },
  title: {
    width: undefined,
  },
});

export default styles;
