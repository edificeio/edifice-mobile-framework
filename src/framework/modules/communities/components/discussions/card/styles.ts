import { PixelRatio, StyleSheet, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export type DiscussionCardState = 'default' | 'hidden' | 'new';

export const AVATAR_LOADER_SIZE = UI_SIZES.elements.avatar.sm;

const CARD_CONTAINER_STYLE: ViewStyle = {
  alignSelf: 'stretch',
  borderRadius: UI_SIZES.radius.newCard,
  flexDirection: 'column',
  gap: UI_SIZES.spacing.small,
  padding: UI_SIZES.spacing.medium,
};

const ICON_SQUARE_SIZE = getScaleWidth(52);
const RED_DOT_SIZE = getScaleWidth(6);

const LOADER_TITLE_HEIGHT = TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale();
const LOADER_SUBTITLE_HEIGHT = TextSizeStyle.Normal.lineHeight * PixelRatio.getFontScale();
const LOADER_STATUS_WIDTH = getScaleWidth(128);
const AVATAR_OVERLAP_RATIO = 1 / 4;
const AVATAR_LOADER_SIDE_OVERLAP = (AVATAR_LOADER_SIZE * AVATAR_OVERLAP_RATIO) / 2;

const loaderLineBase = {
  borderRadius: UI_SIZES.radius.card,
};

export const getCardStyle = (state: DiscussionCardState) => {
  switch (state) {
    case 'new':
      return styles.cardNew;
    case 'hidden':
      return styles.cardHidden;
    default:
      return styles.cardDefault;
  }
};

export const styles = StyleSheet.create({
  avatarStack: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    justifyContent: 'space-between',
  },
  bottomRowLeft: {
    alignItems: 'center',
    flex: 0,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  cardDefault: {
    ...CARD_CONTAINER_STYLE,
    borderColor: theme.palette.grey.cloudy,
    borderWidth: UI_SIZES.border.thin,
  },
  cardHidden: {
    ...CARD_CONTAINER_STYLE,
    borderColor: theme.palette.status.info.light,
    borderStyle: 'dashed',
    borderWidth: UI_SIZES.border.small,
    padding: UI_SIZES.spacing.medium - UI_SIZES.border.small / 2,
  },
  cardNew: {
    ...CARD_CONTAINER_STYLE,
    borderColor: theme.palette.status.failure.light,
    borderWidth: UI_SIZES.border.thin,
  },
  content: {
    flex: 1,
    gap: UI_SIZES.spacing.tiny,
  },
  iconSquare: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.newCard,
    height: ICON_SQUARE_SIZE,
    justifyContent: 'center',
    width: ICON_SQUARE_SIZE,
  },
  loaderAvatar: {
    backgroundColor: theme.ui.background.card,
    borderRadius: AVATAR_LOADER_SIZE / 2 + UI_SIZES.border.small,
    height: AVATAR_LOADER_SIZE + UI_SIZES.border.small * 2,
    marginHorizontal: -UI_SIZES.border.small - AVATAR_LOADER_SIDE_OVERLAP,
    marginVertical: -UI_SIZES.border.small,
    padding: UI_SIZES.border.small,
    width: AVATAR_LOADER_SIZE + UI_SIZES.border.small * 2,
  },
  loaderAvatarStack: {
    flexDirection: 'row',
    paddingHorizontal: AVATAR_LOADER_SIDE_OVERLAP,
  },
  loaderContent: {
    gap: UI_SIZES.spacing.small,
  },
  loaderIconSquare: {
    borderRadius: UI_SIZES.radius.newCard,
    height: ICON_SQUARE_SIZE,
    width: ICON_SQUARE_SIZE,
  },
  loaderStatus: {
    ...loaderLineBase,
    height: LOADER_SUBTITLE_HEIGHT,
    width: LOADER_STATUS_WIDTH,
  },
  loaderSubtitle: {
    ...loaderLineBase,
    height: LOADER_SUBTITLE_HEIGHT,
  },
  loaderTitle: {
    ...loaderLineBase,
    height: LOADER_TITLE_HEIGHT,
  },
  redDot: {
    backgroundColor: theme.palette.status.failure.regular,
    borderRadius: RED_DOT_SIZE / 2,
    height: RED_DOT_SIZE,
    position: 'absolute',
    right: 0,
    top: 0,
    width: RED_DOT_SIZE,
  },
  responseDefault: {
    color: theme.palette.grey.black,
  },
  subtitleDefault: {
    color: theme.palette.grey.graphite,
  },
  subtitleNew: {
    color: theme.palette.status.failure.regular,
  },
  topRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
});
