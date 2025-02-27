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
    borderWidth: 1,
    height: '100%',
    justifyContent: 'center',
    padding: UI_SIZES.spacing.medium,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    bottom: 0,
    height: BUTTON_CONTAINER_SIZE,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.tiny,
    position: 'absolute',
    right: 0,
    width: BUTTON_CONTAINER_SIZE,
  },
});
