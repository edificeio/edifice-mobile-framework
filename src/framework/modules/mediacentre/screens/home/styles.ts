import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  listHeaderContainer: {
    rowGap: UI_SIZES.spacing.small,
    margin: UI_SIZES.spacing.small,
  },
  listHeaderZIndex: {
    zIndex: 99,
  },
});
