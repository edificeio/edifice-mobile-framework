import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //ELEMENTS
  action: {
    alignSelf: 'center',
    backgroundColor: theme.palette.grey.fog,
  },

  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },

  h24: {
    height: getScaleWidth(24),
  },

  h26: {
    height: getScaleWidth(26),
  },

  h38: {
    height: getScaleWidth(38),
  },

  heading: {
    backgroundColor: theme.palette.grey.cloudy,
  },

  mb0: {
    marginBottom: 0,
  },
  mt24: {
    marginTop: UI_SIZES.spacing.big,
  },
  topContent: {
    rowGap: UI_SIZES.spacing.medium,
  },
});
