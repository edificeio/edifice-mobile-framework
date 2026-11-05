import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  row: {
    backgroundColor: theme.palette.grey.white,
  },
  separator: {
    backgroundColor: theme.palette.grey.cloudy,
    height: UI_SIZES.border.thin,
  },
});
