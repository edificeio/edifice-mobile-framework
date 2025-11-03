import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.small,
  },
  flex0: {
    flex: 0,
  },
  flex1: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.small,
  },
});
