import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const FILTER_BUTTON_MIN_WIDTH = getScaleWidth(102);

export default StyleSheet.create({
  content: {
    padding: UI_SIZES.spacing.medium,
  },
  filterBar: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  filterButton: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.input,
    height: getScaleWidth(UI_SIZES.dimensions.height.huge),
    minWidth: FILTER_BUTTON_MIN_WIDTH,
  },
});
