import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
});
