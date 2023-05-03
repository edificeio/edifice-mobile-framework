import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  colorsText: {
    marginRight: UI_SIZES.spacing.minor,
  },
  listContainer: {
    zIndex: -5,
  },
  headerContainer: {
    margin: UI_SIZES.spacing.medium,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  dropdownMargin: {
    marginRight: UI_SIZES.spacing.small,
  },
  dropdownText: {
    color: theme.ui.text.regular,
  },
  dropdownsContainer: {
    flexDirection: 'row',
    zIndex: 100,
    marginVertical: UI_SIZES.spacing.small,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
