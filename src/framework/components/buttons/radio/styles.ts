import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
  },
  disabledLabelText: {
    color: theme.palette.grey.grey,
  },
  iconContainer: {
    padding: UI_SIZES.spacing.tiny,
    borderRadius: 50,
  },
  iconPressedContainer: {
    backgroundColor: theme.palette.primary.pale,
  },
  labelText: {
    flexShrink: 1,
  },
});
