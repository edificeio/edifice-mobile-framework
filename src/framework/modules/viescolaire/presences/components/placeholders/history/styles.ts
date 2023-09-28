import { StyleSheet } from 'react-native';

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
  listContainer: {
    rowGap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
});
