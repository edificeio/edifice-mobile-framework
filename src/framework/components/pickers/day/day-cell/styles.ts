import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

const containerPadding = UI_SIZES.spacing.minor;
const textWidth = getScaleWidth(UI_SIZES.dimensions.width.large);
const dayCellDimension = textWidth + containerPadding * 2;

export const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    zIndex: 1,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    width: dayCellDimension,
    height: dayCellDimension,
  },
  container: {
    padding: containerPadding,
    borderRadius: UI_SIZES.radius.medium,
  },
  text: {
    textAlign: 'center',
    width: textWidth,
  },
});
