import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  boxIcon: {
    width: UI_SIZES.dimensions.width.mediumPlus,
    height: UI_SIZES.dimensions.height.mediumPlus,
    borderRadius: UI_SIZES.dimensions.width.mediumPlus / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
