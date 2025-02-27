import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    paddingVertical: UI_SIZES.spacing.minor,
  },
});
