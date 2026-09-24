import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.medium,
    paddingBottom: UI_SIZES.spacing.big,
  },
  emptyContent: {
    flexGrow: 1,
  },
  widgets: {
    gap: UI_SIZES.spacing.minor,
  },
});
