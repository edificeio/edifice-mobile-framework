import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  imageLabel: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    marginLeft: UI_SIZES.spacing.minor,
    maxWidth: UI_SIZES.screen.width - 6 * UI_SIZES.spacing.medium - 2 * UI_SIZES.spacing.minor,
  },
  topContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: UI_SIZES.spacing.minor,
  },
});
