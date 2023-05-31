import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  emptyListContainer: {
    backgroundColor: theme.ui.background.card,
  },
  listContentContainer: {
    flexGrow: 1,
    backgroundColor: theme.ui.background.card,
  },
  navBarCountText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: theme.ui.text.inverse,
  },
  navBarLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: UI_SIZES.spacing.minor,
  },
  navBarRightContainer: {
    flexDirection: 'row',
    marginRight: UI_SIZES.spacing.small,
  },
  navBarTitle: {
    width: undefined,
  },
  rightMargin: {
    marginRight: UI_SIZES.spacing.small,
  },
});
