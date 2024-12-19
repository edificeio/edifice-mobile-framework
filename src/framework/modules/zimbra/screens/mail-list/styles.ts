import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  emptyListContainer: {
    backgroundColor: theme.ui.background.card,
  },
  listContentContainer: {
    flexGrow: 1,
  },
  navBarCountText: {
    color: theme.ui.text.inverse,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  navBarLeftContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: UI_SIZES.spacing.minor,
  },
  navBarRightContainer: {
    flexDirection: 'row',
    marginRight: UI_SIZES.spacing.small,
  },
  navBarTitle: {
    width: undefined,
  },
  pageContainer: {
    backgroundColor: theme.ui.background.card,
  },
  rightMargin: {
    marginRight: UI_SIZES.spacing.small,
  },
  searchBarContainer: {
    margin: UI_SIZES.spacing.small,
  },
});
