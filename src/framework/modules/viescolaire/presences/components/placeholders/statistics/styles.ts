import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },
  h22: {
    height: getScaleHeight(22),
  },
  mb0: {
    marginBottom: 0,
  },
  //ELEMENTS
  countMethodText: {
    marginTop: UI_SIZES.spacing.small,
    backgroundColor: theme.palette.grey.cloudy,
  },
  listContainer: {
    rowGap: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
});
