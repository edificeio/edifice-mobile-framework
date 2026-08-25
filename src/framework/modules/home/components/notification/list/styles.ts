import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const ACTION_WIDTH = getScaleWidth(80);

export const ACTION_ICON_SIZE = getScaleWidth(22);

const ACTION_BUTTON_WIDTH = getScaleWidth(39);
const ACTION_BUTTON_HEIGHT = getScaleWidth(38);

export default StyleSheet.create({
  action: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
    gap: UI_SIZES.spacing.minor,
    justifyContent: 'center',
    width: ACTION_WIDTH,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.huge,
    borderWidth: UI_SIZES.border.thin,
    height: ACTION_BUTTON_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor,
    width: ACTION_BUTTON_WIDTH,
  },
  actions: {
    flexDirection: 'row',
  },
  actionText: {
    color: theme.palette.grey.black,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
  },
  row: {
    backgroundColor: theme.palette.grey.white,
  },
  separator: {
    backgroundColor: theme.palette.grey.cloudy,
    height: UI_SIZES.border.thin,
  },
});
