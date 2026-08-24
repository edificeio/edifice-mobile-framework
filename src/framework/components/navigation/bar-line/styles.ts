import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  background: {
    flex: 1,
  },
  line: {
    height: UI_SIZES.border.small,
    position: 'absolute',
    width: '100%',
  },
  lineNavBar: {
    bottom: 0,
  },
  lineTabBar: {
    top: 0,
  },
});
