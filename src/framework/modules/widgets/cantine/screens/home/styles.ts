import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  // keeps the header under the nav bar while it moves up.
  container: {
    flex: 1,
    overflow: 'hidden',
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
  header: {
    backgroundColor: theme.ui.background.card,
    borderBottomColor: theme.ui.border.listItem,
    borderBottomWidth: UI_SIZES.border.thin,
    left: 0,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.medium,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
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
    zIndex: 1,
  },
});
