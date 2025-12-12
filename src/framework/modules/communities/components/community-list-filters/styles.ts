import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  filterBar: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.minor,
  },
});
