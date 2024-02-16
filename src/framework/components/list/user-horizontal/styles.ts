import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  contentContainer: {
    columnGap: UI_SIZES.spacing.minor,
    alignItems: 'stretch',
    // Default styles for UserList
  },
  item: {
    flexGrow: 1,
    // Default styles for UserList items
  },
  itemText: {
    textAlign: 'center',
  },
});
