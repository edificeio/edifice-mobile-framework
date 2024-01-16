import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },
  h38: {
    height: getScaleWidth(38),
  },
  h26: {
    height: getScaleWidth(26),
  },
  h24: {
    height: getScaleWidth(24),
  },
  mb0: {
    marginBottom: 0,
  },
  mt24: {
    marginTop: UI_SIZES.spacing.big,
  },
  //ELEMENTS
  action: {
    alignSelf: 'center',
    backgroundColor: theme.palette.grey.fog,
  },
  heading: {
    backgroundColor: theme.palette.grey.cloudy,
  },
  topContent: {
    rowGap: UI_SIZES.spacing.medium,
  },
});
