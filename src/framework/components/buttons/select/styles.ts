import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  // Styles for the list in bottom sheet
  bottomSheetListContainer: {
    backgroundColor: theme.palette.grey.white,
    flex: 1,
  },

  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Default list item styles
  defaultListItem: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.small,
    padding: UI_SIZES.spacing.medium,
  },

  defaultListItemText: {
    flex: 1,
  },

  leftContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },

  listContainer: {
    backgroundColor: theme.palette.grey.white,
    flex: 1,
  },

  spacingItem: {
    height: UI_SIZES.spacing.tiny,
  },

  text: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.minor,
  },
  textNoIcon: {
    flex: 1,
    marginLeft: 0,
  },
});
