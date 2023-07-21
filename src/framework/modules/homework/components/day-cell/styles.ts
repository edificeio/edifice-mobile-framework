import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: UI_SIZES.dimensions.width.huge,
    width: UI_SIZES.dimensions.width.hug,
    borderRadius: UI_SIZES.radius.small,
    borderWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
  },
  selected: {
    borderWidth: UI_SIZES.border.small,
    borderColor: '#5AC235',
    backgroundColor: '#E7F6E0',
  },
});
