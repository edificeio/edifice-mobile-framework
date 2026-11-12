import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_VALUES } from '~/framework/components/constants';

export default StyleSheet.create({
  navBarActionDisabled: {
    opacity: 0.618,
  },
  navBarActionIcon: {
    height: UI_SIZES.elements.icon.default,
  },
  navBarActionPressed: {
    opacity: UI_VALUES.opacity.modal,
  },
  navBarActionText: {
    marginHorizontal: -UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.tiny,
  },
  navBarActionTitle: {
    color: theme.ui.navigation.navBar.tint.toString(),
  },
  navBarActionWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  navBarActionWrapperIcon: {
    height: UI_SIZES.elements.navbarButtonSize,
    justifyContent: 'center',
    width: UI_SIZES.elements.navbarButtonSize,
  },
});
