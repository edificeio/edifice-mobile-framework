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
    columnGap: UI_SIZES.spacing.small,
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

  leftContainer: {
    flexGrow: 1,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    rowGap: UI_SIZES.spacing.minor,
  },
  mb0: {
    marginBottom: 0,
  },
  status: {
    backgroundColor: theme.palette.grey.cloudy,
  },
  statusContainer: {
    backgroundColor: theme.palette.grey.pearl,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.small,
  },
  w22: {
    width: getScaleWidth(22),
  },
});
