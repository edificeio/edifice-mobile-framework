import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    padding: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
  },
  text: {
    textAlign: 'center',
    width: getScaleWidth(UI_SIZES.dimensions.width.mediumPlus),
  },
});
