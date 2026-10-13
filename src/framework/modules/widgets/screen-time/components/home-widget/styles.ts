import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  // The message card stands where the durations stand, so it keeps their inset in the panel.
  empty: {
    margin: UI_SIZES.spacing.minor,
  },
});
