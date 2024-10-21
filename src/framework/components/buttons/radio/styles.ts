import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disabledLabelText: {
    color: theme.palette.grey.grey,
  },
  iconContainer: {
    borderRadius: 50,
    padding: UI_SIZES.spacing.tiny,
  },
  iconPressedContainer: {
    backgroundColor: theme.palette.primary.pale,
  },
  labelText: {
    flexShrink: 1,
  },
});
