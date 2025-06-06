import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  round: {
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  secondary: {
    borderRadius: UI_SIZES.radius.extraLarge,
    borderWidth: UI_SIZES.elements.border.default,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
});
