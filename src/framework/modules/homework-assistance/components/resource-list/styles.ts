import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  headingText: {
    textAlign: 'center',
  },
  listContentContainer: {
    columnGap: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.medium,
  },
});
