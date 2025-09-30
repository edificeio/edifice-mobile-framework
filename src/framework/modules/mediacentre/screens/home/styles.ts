import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  listContentContainer: {
    rowGap: UI_SIZES.spacing.minor,
  },
  listHeaderContainer: {
    margin: UI_SIZES.spacing.small,
    rowGap: UI_SIZES.spacing.small,
  },
  listHeaderZIndex: {
    zIndex: 99,
  },
});
