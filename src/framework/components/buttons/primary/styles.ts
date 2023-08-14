import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  primary: {
    borderRadius: UI_SIZES.radius.extraLarge,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  round: {
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
});
