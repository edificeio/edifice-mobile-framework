import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  navBarTitle: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.tinyExtra,
    height: UI_SIZES.elements.navbarHeight,
    justifyContent: 'center',
  },
  navBarTitleName: {
    color: theme.ui.navigation.navBar.tint.toString(),
    lineHeight: getScaleFontSize(18),
  },
  navBarTitleType: {
    color: theme.ui.navigation.navBar.tint.toString(),
    lineHeight: getScaleFontSize(16),
  },
  page: {
    backgroundColor: theme.ui.background.page.toString(),
    flex: 1,
  },
});
