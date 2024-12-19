import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },
  //ELEMENTS
  container: {
    borderColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  h22: {
    height: getScaleWidth(22),
  },

  h24: {
    height: getScaleWidth(24),
  },

  heading: {
    backgroundColor: theme.palette.grey.cloudy,
  },

  mb0: {
    marginBottom: 0,
  },
  picto: {
    backgroundColor: theme.palette.grey.cloudy,
  },
  pictoContainer: {
    backgroundColor: theme.palette.grey.pearl,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.small,
  },
  rightContainer: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.minor,
    rowGap: UI_SIZES.spacing.tiny,
  },
  w22: {
    width: getScaleWidth(22),
  },
});
