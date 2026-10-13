import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const ADD_BUTTON_SIZE = getScaleWidth(UI_SIZES.dimensions.height.huge);

export const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.pale,
    borderRadius: ADD_BUTTON_SIZE / 2,
    gap: UI_SIZES.spacing.minor,
    height: ADD_BUTTON_SIZE,
    justifyContent: 'center',
    // A drawn circle, not an icon sitting in a box: the navbar touch minimum would stretch it past
    // its own radius and past the bar, so it keeps the height the design gave it.
    minHeight: ADD_BUTTON_SIZE,
    padding: UI_SIZES.spacing.minor,
    width: ADD_BUTTON_SIZE,
  },
  navBarTitle: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.tinyExtra,
  },
  navBarTitleName: {
    color: theme.ui.navigation.navBar.tint.toString(),
    lineHeight: getScaleFontSize(UI_SIZES.dimensions.height.medium),
  },
  navBarTitleType: {
    color: theme.ui.navigation.navBar.tint.toString(),
    lineHeight: getScaleFontSize(UI_SIZES.dimensions.height.smallPlus),
  },
  page: {
    flex: 1,
  },
});
