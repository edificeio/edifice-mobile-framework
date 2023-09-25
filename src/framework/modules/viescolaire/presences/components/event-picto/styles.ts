import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
  },
  contentContainer: {
    flexShrink: 1,
    padding: UI_SIZES.spacing.minor,
  },
});
