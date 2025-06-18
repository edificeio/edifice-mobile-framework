import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { WAVEFORM_AND_BUTTONS_CONTAINER_HEIGHT } from '~/framework/util/audioFiles/recorder/styles';

const styles = StyleSheet.create({
  buttonDelete: {
    padding: UI_SIZES.spacing.minor,
  },
  buttonPlayPause: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.extraLarge,
    borderWidth: UI_SIZES.border.small,
    height: UI_SIZES.elements.icon.default * 2,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
    width: UI_SIZES.elements.icon.default * 2,
  },
  buttonSave: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.extraLarge,
    height: UI_SIZES.elements.icon.xlarge,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
    width: UI_SIZES.elements.icon.xlarge,
  },
  buttonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: getScaleWidth(327),
  },
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    height: WAVEFORM_AND_BUTTONS_CONTAINER_HEIGHT,
    paddingHorizontal: UI_SIZES.spacing.big,
    width: getScaleWidth(327),
  },
});

export default styles;
