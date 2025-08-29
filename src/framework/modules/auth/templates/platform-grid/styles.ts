import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  footer: {
    paddingBottom: UI_SIZES.screen.bottomInset,
  },
  heading: {
    color: theme.ui.text.regular,
    marginBottom: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.medium + UI_SIZES.screen.topInset,
    textAlign: 'center',
  },
  lightP: { color: theme.ui.text.light, marginBottom: UI_SIZES.spacing.small, textAlign: 'center' },
  picture: { height: 64, width: '100%' },
  section: {
    margin: UI_SIZES.spacing.medium,
  },
  sectionTitle: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.small,
  },
  version: {
    color: theme.palette.grey.graphite,
    textAlign: 'center',
  },
});
