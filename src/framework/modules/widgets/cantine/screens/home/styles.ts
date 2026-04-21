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
  contentHeader: {
    zIndex: 10,
  },
  dropdownContainer: {
    marginBottom: UI_SIZES.spacing.small,
  },
  mealSwitcher: {
    borderColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.input,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
  },
  mealSwitcherItem: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.medium,
    flex: 1,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  mealSwitcherItemActive: {
    backgroundColor: theme.palette.primary.pale,
  },
  mealSwitcherItemInactive: {
    backgroundColor: theme.palette.grey.white,
  },
  mealSwitcherText: {
    textAlign: 'center',
  },
  menuWrapper: {
    flex: 1,
    zIndex: 1,
  },
});
