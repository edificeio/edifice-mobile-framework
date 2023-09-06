import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  closeButton: {
    width: UI_SIZES.dimensions.height.largerPlus,
    height: UI_SIZES.dimensions.height.largerPlus,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: undefined,
    borderWidth: 0,
  },
});
