import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  button: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.extraLarge,
    bottom: UI_SIZES.elements.navbarHeight,
    padding: UI_SIZES.spacing.minor,
    position: 'absolute',
    right: UI_SIZES.spacing.big,
  },
  closeButton: {
    left: UI_SIZES.spacing.medium + UI_SIZES.spacing.tiny,
    position: 'absolute',
    top: UI_SIZES.elements.navbarHeight + UI_SIZES.spacing.minor,
  },
  webview: { flex: 1 },
});
