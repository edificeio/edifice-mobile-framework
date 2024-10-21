import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  content: {
    backgroundColor: theme.ui.background.page,
    flexGrow: 1,
  },
  contentStyle2: {
    backgroundColor: theme.ui.background.page,
    flex: 1,
  },
  detailsMain: {
    backgroundColor: theme.ui.background.card,
  },
  detailsNeedValidation: {
    color: theme.palette.status.warning.regular,
  },
  detailsPost: {
    marginTop: UI_SIZES.spacing.medium,
  },
  detailsTitleBlog: {
    color: theme.ui.text.light,
  },
  detailsTitlePost: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  footer: {
    padding: UI_SIZES.spacing.medium,
    paddingTop: 0,
  },
  footerNoComment: {
    height: 0,
  },
  footerWaitingValidation: {
    color: theme.palette.secondary.regular,
  },
  loader: {
    backgroundColor: theme.ui.background.page,
    flex: 1,
    height: '100%',
    opacity: 0.999,
    pointerEvents: 'none',
    position: 'absolute',
    width: '100%',
    zIndex: 1000,
  },
});
