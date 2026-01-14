import { StyleSheet } from 'react-native';

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
    marginBottom: UI_SIZES.spacing.small,
  },
  menuWrapper: {
    flex: 1,
  },
});
