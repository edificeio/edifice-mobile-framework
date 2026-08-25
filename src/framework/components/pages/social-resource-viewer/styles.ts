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
  itemCommentContentWrapperDeletedComment: { paddingBottom: 0 },
  itemCommon: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  itemContentButtons: { flexDirection: 'row', gap: UI_SIZES.spacing.minor, justifyContent: 'flex-start' },
  itemContentDeletedText: {
    borderColor: theme.palette.grey.pearl,
    borderWidth: UI_SIZES.border.small,
  },
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
  itemResponseDeleted: {
    gap: 0, // reset gap for deleted responses
  },
  itemResponsesShowMoreButtonWrapper: {
    alignItems: 'flex-start',
    marginLeft: -UI_SIZES.spacing.medium, // Compensate Ghost Button padding to align inner text
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  itemTreeComment: { gap: UI_SIZES.spacing.minor - UI_SIZES.border.small },
  itemTreeCommon: { alignItems: 'center', flex: 0, flexBasis: AvatarSizes.xsm, flexDirection: 'column' },
  itemTreeDecoCurveCenter: {
    marginBottom: AvatarSizes.xsm / 4 + UI_SIZES.border.small * 2,
  },
  itemTreeDecoCurveCommon: {
    alignSelf: 'stretch',
    borderBottomLeftRadius: UI_SIZES.radius.newCard,
    borderBottomWidth: UI_SIZES.border.small,
    borderColor: theme.palette.grey.cloudy,
    borderLeftWidth: UI_SIZES.border.small,

    height: AvatarSizes.xsm / 2 + UI_SIZES.border.small / 2,
    marginLeft: AvatarSizes.xsm / 2 - UI_SIZES.border.small / 2,
    marginRight: -UI_SIZES.spacing.tiny,
  },
  itemTreeDecoCurveTop: {
    height: UI_SIZES.spacing.small + UI_SIZES.border.small / 2 + AvatarSizes.xsm / 2 + UI_SIZES.border.small / 2,
  },
  itemTreeDecoStraight: {
    backgroundColor: theme.palette.grey.cloudy,
    bottom: 0,
    flex: 1,
    position: 'absolute',
    top: 0,
    width: UI_SIZES.border.small,
  },
  itemTreeDecoStraightComment: {
    top: AvatarSizes.xsm + UI_SIZES.spacing.minor - UI_SIZES.border.small,
  },
  itemTreeDecoStraightTop: {
    bottom: '50%',
    marginBottom: UI_SIZES.spacing.small - UI_SIZES.border.small / 2,
  },
  itemTreeResponse: {
    marginRight: UI_SIZES.spacing.tiny,
  },
  itemTreeResponseDeleted: {
    justifyContent: 'center',
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
