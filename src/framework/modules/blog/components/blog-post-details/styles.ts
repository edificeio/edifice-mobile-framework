import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  blogTitle: {
    color: theme.ui.text.light,
  },
  container: {
    backgroundColor: theme.ui.background.card,
  },
  content: {
    padding: UI_SIZES.spacing.medium,
  },
  contentHeader: {
    paddingBottom: UI_SIZES.spacing.medium,
  },
  footer: {
    padding: UI_SIZES.spacing.medium,
    paddingTop: 0,
  },
  postNeedValidation: {
    color: theme.palette.status.warning.regular,
  },
});
