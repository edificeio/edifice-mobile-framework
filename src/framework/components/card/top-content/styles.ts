import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  imageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  topContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.minor,
  },
});
