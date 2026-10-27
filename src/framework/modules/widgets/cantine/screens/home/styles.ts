import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: UI_SIZES.spacing.medium,
  },
  contentHeader: {
    zIndex: 10,
  },
  dayPicker: {
    paddingHorizontal: 0,
  },
  dropdownContainer: {
    marginBottom: UI_SIZES.spacing.small,
  },
  mealSegments: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  menuWrapper: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
