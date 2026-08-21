import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const REPORT_ACTION_WIDTH = getScaleWidth(100);

export const REPORT_ICON_SIZE = getScaleWidth(22);

const REPORT_BUTTON_WIDTH = getScaleWidth(39);
const REPORT_BUTTON_HEIGHT = getScaleWidth(38);

export default StyleSheet.create({
  empty: {
    flex: 1,
  },
  reportAction: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
    gap: UI_SIZES.spacing.minor,
    justifyContent: 'center',
    width: REPORT_ACTION_WIDTH,
  },
  reportButton: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.secondary.dark,
    borderRadius: UI_SIZES.radius.huge,
    borderWidth: UI_SIZES.border.thin,
    height: REPORT_BUTTON_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor,
    width: REPORT_BUTTON_WIDTH,
  },
  reportText: {
    color: theme.palette.secondary.dark.toString(),
    textAlign: 'center',
  },
  row: {
    backgroundColor: theme.palette.grey.white,
  },
  separator: {
    backgroundColor: theme.palette.grey.cloudy,
    height: UI_SIZES.border.thin,
  },
});
