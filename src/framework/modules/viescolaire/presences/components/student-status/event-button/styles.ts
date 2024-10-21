import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.newCard,
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    padding: UI_SIZES.spacing.minor,
  },
  containerDisabled: {
    backgroundColor: theme.palette.grey.pearl,
  },
});
