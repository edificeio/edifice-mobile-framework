import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  label: {
    height: UI_SIZES.elements.icon.xsmall,
    width: UI_SIZES.elements.icon.xsmall,
  },
  labels: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
  },
});
