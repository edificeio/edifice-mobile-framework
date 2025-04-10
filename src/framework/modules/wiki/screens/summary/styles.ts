import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  emptyPage: { backgroundColor: undefined, paddingTop: 0 },
  newPageButton: {
    alignSelf: 'baseline',
    marginBottom: UI_SIZES.spacing.big,
    marginLeft: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.minor,
  },
  page: {
    backgroundColor: theme.ui.background.card,
  },
  pageListTitle: {
    marginBottom: UI_SIZES.spacing.medium,
    marginHorizontal: UI_SIZES.spacing.big,
  },
});
