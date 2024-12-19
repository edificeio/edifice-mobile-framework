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
  postCommentsIcon: {
    marginRight: UI_SIZES.spacing.minor,
  },
  postCommentsTotal: {
    alignItems: 'center',
    borderBottomColor: theme.ui.border.input,
    borderBottomWidth: 1,
    borderTopColor: theme.ui.border.input,
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.small,
  },
  postCommentsTotalText: {
    color: theme.ui.text.light,
  },
  postNeedValidation: {
    color: theme.palette.status.warning.regular,
  },
});
