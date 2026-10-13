import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const { height, thumb, width } = UI_SIZES.elements.toggle;

const TRACK_BORDER_WIDTH = UI_SIZES.border.thin;

const INNER_SPACING = (height - 2 * TRACK_BORDER_WIDTH - thumb) / 2;

const THUMB_CROSS_DISTANCE = width - 2 * TRACK_BORDER_WIDTH - 2 * INNER_SPACING - thumb;

const HALO_SPACING = UI_SIZES.spacing.tiny;

const HALO_RADIUS = (height + 2 * HALO_SPACING) / 2;

export const TRANSLATE_X_OFF = INNER_SPACING;
export const TRANSLATE_X_ON = INNER_SPACING + THUMB_CROSS_DISTANCE;

export const styles = StyleSheet.create({
  halo: {
    alignItems: 'center',
    borderRadius: HALO_RADIUS,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: HALO_SPACING,
  },
  pressable: {
    alignSelf: 'flex-start',
  },
  thumb: {
    borderRadius: thumb / 2,
    height: thumb,
    width: thumb,
  },
  track: {
    borderRadius: height / 2,
    borderWidth: TRACK_BORDER_WIDTH,
    height,
    justifyContent: 'center',
    width,
  },
});
