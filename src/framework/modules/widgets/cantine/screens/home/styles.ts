import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  dayPicker: {
    paddingHorizontal: 0,
  },
  dropdownContainer: {
    marginBottom: UI_SIZES.spacing.small,
  },
  header: {
    marginBottom: UI_SIZES.spacing.medium,
    zIndex: 10,
  },
  headerContent: {
    paddingTop: UI_SIZES.spacing.medium,
  },
  mealSegments: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  menuContent: {
    paddingBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  menuWrapper: {
    flex: 1,
  },
});
