import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  messages: {
    padding: UI_SIZES.spacing.medium,
  },
  placeholderContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.big,
  },
});
