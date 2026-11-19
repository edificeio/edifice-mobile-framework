import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  infoMessageItem: {
    backgroundColor: theme.palette.complementary.blue.pale,
    marginLeft: getScaleWidth(34) + UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
});
