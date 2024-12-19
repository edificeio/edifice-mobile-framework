import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  boxIcon: {
    alignItems: 'center',
    borderRadius: UI_SIZES.dimensions.width.mediumPlus / 2,
    height: UI_SIZES.dimensions.height.mediumPlus,
    justifyContent: 'center',
    width: UI_SIZES.dimensions.width.mediumPlus,
  },
});
