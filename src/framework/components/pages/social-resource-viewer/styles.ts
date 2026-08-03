import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const COMMENT_FORM_OVERSCROLL_SIZE = UI_SIZES.spacing.huge;

export default StyleSheet.create({
  itemAuthor: {
    flexShrink: 1,
  },
  itemComment: {
    borderColor: theme.palette.grey.cloudy,
    borderTopWidth: UI_SIZES.border.thin,
    paddingTop: UI_SIZES.spacing.small - UI_SIZES.border.thin,
  },
  itemCommon: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  itemContentButtons: { flexDirection: 'row', gap: UI_SIZES.spacing.minor },
  itemContentText: {
    backgroundColor: theme.palette.grey.fog,
    borderRadius: UI_SIZES.radius.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  itemContentWrapper: { flex: 1, gap: UI_SIZES.spacing.tiny, paddingBottom: UI_SIZES.spacing.minor },
  itemDate: {
    color: theme.palette.grey.graphite,
    flex: 0,
    marginLeft: UI_SIZES.spacing.minor,
  },
  itemResponse: {},
  itemTreeComment: { gap: UI_SIZES.spacing.minor - UI_SIZES.border.small },
  itemTreeCommon: { alignItems: 'center', flex: 0 },
  itemTreeDecoStraight: { backgroundColor: theme.palette.grey.cloudy, flex: 1, width: UI_SIZES.border.small },
  itemTreeResponse: {},
  itemUserHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
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
