import { StyleSheet } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from '../../constants';

export const COMMENT_FORM_OVERSCROLL_SIZE = UI_SIZES.spacing.huge;

export default StyleSheet.create({
  page: { backgroundColor: theme.ui.background.page },
  stickyCommentWrapper: {
    alignItems: 'flex-end',
    backgroundColor: theme.ui.background.card,
    borderTopColor: theme.palette.grey.cloudy,
    borderTopWidth: UI_SIZES.border.thin,
    flex: 0,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    marginBottom: -COMMENT_FORM_OVERSCROLL_SIZE,
    paddingBottom: UI_SIZES.spacing.medium + COMMENT_FORM_OVERSCROLL_SIZE,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.medium,
  },
});
