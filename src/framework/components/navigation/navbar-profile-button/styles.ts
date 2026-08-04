import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatar: { padding: UI_SIZES.border.small },
  // Override items padding because react-navigation's styling is broken
  button: { marginLeft: 0 },
});
