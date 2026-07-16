import { StyleSheet, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export type ConversationCardState = 'default' | 'hidden' | 'new';

const CARD_CONTAINER_STYLE: ViewStyle = {
  alignSelf: 'stretch',
  borderRadius: UI_SIZES.radius.newCard,
  flexDirection: 'column',
  gap: UI_SIZES.spacing.small,
  padding: UI_SIZES.spacing.medium,
};

const ICON_SQUARE_SIZE = getScaleWidth(52);
const RED_DOT_SIZE = getScaleWidth(6);

export const getCardStyle = (state: ConversationCardState) => {
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
