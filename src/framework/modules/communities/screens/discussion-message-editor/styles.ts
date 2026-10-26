import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  headerLoader: {
    alignItems: 'center',
    height: UI_SIZES.elements.navbarIconSize,
    justifyContent: 'center',
    width: UI_SIZES.elements.navbarIconSize,
  },
  page: {
    padding: UI_SIZES.spacing.medium,
  },
});
