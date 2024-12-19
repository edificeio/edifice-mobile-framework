import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const TOAST_PROOGRESS_THICKNESS = 2;

export default StyleSheet.create({
  container: {
    width: UI_SIZES.screen.width - 2 * UI_SIZES.spacing.minor,
    // Toast will be horizontally-centered automatically by react-native-toast-message
  },
  progress: {
    bottom: -UI_SIZES.border.thin,
    height: TOAST_PROOGRESS_THICKNESS,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
