import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  navBarActionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBarActionWrapperIcon: {
    justifyContent: 'center',
    height: UI_SIZES.elements.navbarButtonSize,
    width: UI_SIZES.elements.navbarButtonSize,
  },
  navBarActionText: {
    padding: UI_SIZES.spacing.tiny,
    marginHorizontal: -UI_SIZES.spacing.tiny,
  },
  navBarActionIcon: {
    height: UI_SIZES.elements.icon,
  },
  navBarActionDisabled: {
    opacity: 0.618,
  },
});
