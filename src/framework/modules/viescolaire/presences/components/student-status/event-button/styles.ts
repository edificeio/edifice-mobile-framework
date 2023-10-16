import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.newCard,
  },
  containerDisabled: {
    backgroundColor: theme.palette.grey.pearl,
  },
});
