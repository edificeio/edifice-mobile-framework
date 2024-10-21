import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  heading: {
    color: theme.ui.text.regular,
    marginBottom: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.medium + UI_SIZES.screen.topInset,
    textAlign: 'center',
  },
  lightP: { color: theme.ui.text.light, marginBottom: UI_SIZES.spacing.small, textAlign: 'center' },
  picture: { height: 64, width: '100%' },
});
