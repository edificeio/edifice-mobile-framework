import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const ADD_BUTTON_SIZE = getScaleWidth(38);

export const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.pale,
    borderRadius: ADD_BUTTON_SIZE / 2,
    gap: UI_SIZES.spacing.minor,
    height: ADD_BUTTON_SIZE,
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
    width: ADD_BUTTON_SIZE,
  },
  navBarTitle: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.tinyExtra,
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
