import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.small,
    borderWidth: UI_SIZES.border.thin,
    height: UI_SIZES.dimensions.width.huge,
    justifyContent: 'center',
    width: UI_SIZES.dimensions.width.hug,
  },
});
