import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },
  //ELEMENTS
  countMethodText: {
    backgroundColor: theme.palette.grey.cloudy,
    marginTop: UI_SIZES.spacing.small,
  },

  h22: {
    height: getScaleHeight(22),
  },

  listContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.small,
  },
  mb0: {
    marginBottom: 0,
  },
});
