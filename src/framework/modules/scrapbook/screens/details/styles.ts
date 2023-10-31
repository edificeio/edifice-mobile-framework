import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  webview: { flex: 1 },
  closeButton: {
    position: 'absolute',
    top: UI_SIZES.elements.navbarHeight + UI_SIZES.spacing.minor,
    left: UI_SIZES.spacing.medium + UI_SIZES.spacing.tiny,
  },
  button: {
    position: 'absolute',
    right: UI_SIZES.spacing.big,
    bottom: UI_SIZES.elements.navbarHeight,
  },
});
