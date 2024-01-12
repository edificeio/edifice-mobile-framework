import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  inputTitle: {
    paddingBottom: UI_SIZES.spacing.small,
    borderBottomWidth: 1,
    borderColor: theme.palette.grey.cloudy,
  },
});
