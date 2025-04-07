import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomNavigation: {
    paddingBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  content: {
    margin: UI_SIZES.spacing.big,
  },
  header: {
    alignItems: 'stretch',
    backgroundColor: theme.palette.primary.pale,
    borderBottomColor: theme.palette.primary.light,
    borderBottomWidth: UI_SIZES.border.thin,
    borderTopColor: theme.palette.primary.light,
    borderTopWidth: UI_SIZES.border.thin,
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  headerAuthorInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  headerAuthorInfoText: {
    flex: 1,
  },
  loader: {
    backgroundColor: theme.ui.background.card,
    flex: 1,
  },
  page: {
    backgroundColor: theme.ui.background.card,
  },
  topNavigation: {
    alignItems: 'stretch',
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  webViewPlaceholder: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
});
