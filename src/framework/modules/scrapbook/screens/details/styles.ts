import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  webview: { flex: 1 },
  button: {
    position: 'absolute',
    right: UI_SIZES.spacing.big,
    bottom: UI_SIZES.spacing.big,
  },
});
