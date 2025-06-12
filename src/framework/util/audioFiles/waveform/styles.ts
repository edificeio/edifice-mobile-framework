import { StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const WAVEFORM_HEIGHT = 35;
export const WAVEFORM_WIDTH = getScaleWidth(327) - UI_SIZES.dimensions.width.largePlus;
export const BAR_SPACE_DEFAULT = 3;
export const BAR_WIDTH_DEFAULT = 2;
export const BAR_MIN_HEIGHT = 2;

const styles = StyleSheet.create({
  timer: {
    alignItems: 'flex-end',
    height: getScaleWidth(24),
    justifyContent: 'center',
    paddingLeft: UI_SIZES.spacing.minor,
    paddingRight: UI_SIZES.spacing.tiny,
  },
  waveform: {
    borderRadius: UI_SIZES.radius.big * 4,
    flex: 1,
    overflow: 'hidden',
  },
  waveformAndTimerContainer: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.big * 4,
    flexDirection: 'row',
    height: getScaleWidth(52),
    justifyContent: 'center',
    marginBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
    width: getScaleWidth(327),
  },
});

export default styles;
