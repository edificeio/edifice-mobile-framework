import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  heading: {
    marginTop: UI_SIZES.spacing.medium + UI_SIZES.screen.topInset,
    marginBottom: UI_SIZES.spacing.big,
    textAlign: 'center',
    color: theme.ui.text.regular,
  },
  lightP: { color: theme.ui.text.light, textAlign: 'center', marginBottom: UI_SIZES.spacing.small },
  picture: { height: 64, width: '100%' },
});
