import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  emptyListContainer: {
    backgroundColor: theme.ui.background.card,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: UI_SIZES.spacing.minor,
  },
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: UI_SIZES.spacing.minor,
  },
  listContentContainer: {
    flexGrow: 1,
    backgroundColor: theme.ui.background.card,
  },
  rightMargin: {
    marginRight: UI_SIZES.spacing.minor,
  },
});
