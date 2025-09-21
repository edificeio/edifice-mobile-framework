import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: UI_SIZES.spacing.medium,
  },
  // DropDownPicker styles
  dropdownContainer: {
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.selector,
    borderWidth: UI_SIZES.border.thin,
  },
  dropdownText: {
    color: theme.palette.grey.black,
    fontSize: 16,
  },
  menuWrapper: {
    flex: 1,
  },
});
