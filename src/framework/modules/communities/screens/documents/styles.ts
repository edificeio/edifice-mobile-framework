import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  item: {
    alignItems: 'stretch',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    flex: 1,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    margin: UI_SIZES.spacing.big / 2,
    padding: UI_SIZES.spacing.minor,
  },
  list: {
    padding: UI_SIZES.spacing.big / 2,
  },
});
