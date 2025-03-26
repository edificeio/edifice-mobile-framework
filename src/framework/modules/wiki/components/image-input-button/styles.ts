import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const BUTTON_CONTAINER_SIZE = getScaleWidth(40);
export const BUTTON_ICON_SIZE = getScaleWidth(20);

export const styles = StyleSheet.create({
  border: {
    alignItems: 'center',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    height: '100%',
    justifyContent: 'center',
    padding: UI_SIZES.spacing.medium,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.palette.grey.white,
    // = borderRadius + padding to keep button and border concentric
    borderRadius: UI_SIZES.radius.medium + UI_SIZES.border.small,
    bottom: -UI_SIZES.border.thin,
    height: BUTTON_CONTAINER_SIZE,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.tiny,
    position: 'absolute',
    right: -UI_SIZES.border.thin,
    width: BUTTON_CONTAINER_SIZE,
  },
});
