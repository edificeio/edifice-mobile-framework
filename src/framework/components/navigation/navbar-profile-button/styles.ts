import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatar: { padding: UI_SIZES.border.small },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    // Override items padding because react-navigation's styling is broken
    marginLeft: 0,
    minHeight: UI_SIZES.elements.navbarButtonTouchSize,
  },
});
