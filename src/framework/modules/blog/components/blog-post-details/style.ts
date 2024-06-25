import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  postNeedValidation: {
    color: theme.palette.status.warning.regular,
  },
  blogTitle: {
    color: theme.ui.text.light,
  },
  postCommentsTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.small,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: theme.ui.border.input,
    borderBottomColor: theme.ui.border.input,
  },
  postCommentsIcon: {
    marginRight: UI_SIZES.spacing.minor,
  },
  postCommentsTotalText: {
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
});
