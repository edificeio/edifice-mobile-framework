import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  bottomSheetPaddingBottom: {
    paddingBottom: UI_SIZES.spacing.big,
  },
  closeButton: {
    padding: UI_SIZES.spacing.minor,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  resetButton: {
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
});
