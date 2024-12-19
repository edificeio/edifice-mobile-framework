import { StyleSheet } from 'react-native';

import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  br4: {
    borderRadius: UI_SIZES.radius.small,
  },
  h22: {
    height: getScaleHeight(22),
  },
  //ELEMENTS
  listContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.minor,
  },

  mb0: {
    marginBottom: 0,
  },
});
