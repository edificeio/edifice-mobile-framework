import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

// export const WAVEFORM_HEIGHT = getScaleWidth(35);
export const WAVEFORM_HEIGHT = 35;

const styles = StyleSheet.create({
  timer: {
    alignItems: 'flex-end',
    height: getScaleWidth(24),
    justifyContent: 'center',
    width: UI_SIZES.dimensions.width.largePlus,
  },
  waveform: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.big * 4,
    overflow: 'hidden',
  },
  waveformAndTimercontainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: WAVEFORM_HEIGHT,
    width: getScaleWidth(327),
  },
});

export default styles;
