import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  listContentContainer: {
    padding: UI_SIZES.spacing.medium,
    rowGap: UI_SIZES.spacing.medium,
  },
  listHeaderContainer: {
    rowGap: UI_SIZES.spacing.small,
    zIndex: 99,
  },
});
