import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

import { AvatarSizes } from '../../avatar/styles';

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
  itemCommentContentWrapper: { flex: 1, gap: UI_SIZES.spacing.tiny, paddingBottom: UI_SIZES.spacing.minor },
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
  itemDate: {
    color: theme.palette.grey.graphite,
    flex: 0,
    marginLeft: UI_SIZES.spacing.minor,
  },
  itemResponse: {},
  itemResponseAvatar: { paddingTop: UI_SIZES.spacing.small },
  itemResponseContentWrapper: { flex: 1, gap: UI_SIZES.spacing.tiny, paddingVertical: UI_SIZES.spacing.small },
  itemTreeComment: { gap: UI_SIZES.spacing.minor - UI_SIZES.border.small },
  itemTreeCommon: { alignItems: 'center', flex: 0, flexBasis: AvatarSizes.xsm },
  itemTreeDecoCurve: {
    alignSelf: 'stretch',
    borderBottomLeftRadius: UI_SIZES.radius.newCard,
    borderBottomWidth: UI_SIZES.border.small,
    borderColor: theme.palette.grey.cloudy,
    borderLeftWidth: UI_SIZES.border.small,
    height: AvatarSizes.xsm / 2 + UI_SIZES.spacing.small + UI_SIZES.border.small / 2,
    marginBottom: -(AvatarSizes.xsm / 2 + UI_SIZES.spacing.small),
    marginLeft: AvatarSizes.xsm / 2 - UI_SIZES.border.small / 2,
    marginRight: -UI_SIZES.spacing.tiny,
    right: 0,
    top: 0,
  },
  itemTreeDecoStraight: { backgroundColor: theme.palette.grey.cloudy, flex: 1, width: UI_SIZES.border.small },
  itemTreeResponse: {
    flexBasis: AvatarSizes.xsm + UI_SIZES.spacing.tiny,
    paddingRight: UI_SIZES.spacing.tiny,
  },
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
