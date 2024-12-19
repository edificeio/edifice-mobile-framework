import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  contentContainer: {
    alignItems: 'stretch',
    columnGap: UI_SIZES.spacing.minor,
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
