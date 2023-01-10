import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  roundButton: {
    width: UI_SIZES.dimensions.width.largePlus,
    height: UI_SIZES.dimensions.height.largePlus,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
