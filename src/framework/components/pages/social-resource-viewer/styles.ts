import { StyleSheet } from 'react-native';

import { UI_SIZES } from '../../constants';

import theme from '~/app/theme';

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
    padding: UI_SIZES.spacing.medium,
  },
});
