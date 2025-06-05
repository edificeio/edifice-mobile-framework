import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const CONTAINER_HEIGHT = UI_SIZES.elements.icon.medium;
const CONTAINER_RADIUS = CONTAINER_HEIGHT / 2;
const CONTAINER_WIDTH = UI_SIZES.dimensions.width.hug;
export const ICON_HEIGHT = UI_SIZES.elements.icon.xsmall;
export const ICON_WIDTH = UI_SIZES.elements.icon.xsmall;

export const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    borderRadius: CONTAINER_RADIUS,
    height: CONTAINER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.tiny,
    width: CONTAINER_WIDTH,
  },
});
