import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

import { BUTTON_WIDTH } from './button/styles';

export default StyleSheet.create({
  backdropContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    left: UI_SIZES.spacing.medium,
    top: -BUTTON_WIDTH / 2,
  },
  closeButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: UI_SIZES.spacing.minor,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: UI_SIZES.spacing.medium,
    right: UI_SIZES.spacing.medium,
  },
  mainContainer: {
    position: 'absolute',
    left: UI_SIZES.spacing.medium,
    bottom: UI_SIZES.spacing.medium,
    width: UI_SIZES.screen.width - 2 * UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.large,
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.card,
    borderWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
  },
});
