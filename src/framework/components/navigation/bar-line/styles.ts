import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  background: {
    flex: 1,
  },
  line: {
    position: 'absolute',
    width: '100%',
  },
  lineNavBar: {
    bottom: 0,
    height: UI_SIZES.border.thin,
  },
  lineTabBar: {
    height: UI_SIZES.border.small,
    top: 0,
  },
});
