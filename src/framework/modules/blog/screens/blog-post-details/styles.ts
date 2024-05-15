import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: theme.ui.background.page,
  },
  contentStyle2: {
    backgroundColor: theme.ui.background.page,
    flex: 1,
  },
  detailsMain: {
    backgroundColor: theme.ui.background.card,
  },
  detailsPost: {
    marginTop: UI_SIZES.spacing.medium,
  },
  detailsNeedValidation: {
    color: theme.palette.status.warning.regular,
  },
  detailsTitleBlog: {
    color: theme.ui.text.light,
  },
  detailsTitlePost: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  footerNoComment: {
    height: 0,
  },
  footer: {
    padding: UI_SIZES.spacing.medium,
    paddingTop: 0,
  },
  footerWaitingValidation: {
    color: theme.palette.secondary.regular,
  },
});
