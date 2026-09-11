import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { DISCUSSION_TYPE_CONFIG } from '~/framework/modules/communities/utils';

const ICON_SQUARE_SIZE = getScaleWidth(56);
const ICON_OVERFLOW = UI_SIZES.spacing.small + UI_SIZES.spacing.minor;
const BAND_PADDING_BOTTOM = UI_SIZES.spacing.tiny;
const AUTHOR_ROW_MIN_HEIGHT = ICON_SQUARE_SIZE - ICON_OVERFLOW - BAND_PADDING_BOTTOM;

const styles = StyleSheet.create({
  authorRow: {
    alignItems: 'flex-end',
    minHeight: AUTHOR_ROW_MIN_HEIGHT,
    paddingLeft: ICON_SQUARE_SIZE + UI_SIZES.spacing.small,
  },
  container: {
    alignSelf: 'stretch',
    borderTopWidth: UI_SIZES.border.thin,
    gap: UI_SIZES.spacing.small,
    paddingBottom: BAND_PADDING_BOTTOM,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.medium,
  },
  date: {
    color: theme.palette.grey.graphite,
  },
  iconSquare: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.newCard,
    borderWidth: UI_SIZES.border.small,
    height: ICON_SQUARE_SIZE,
    justifyContent: 'center',
    width: ICON_SQUARE_SIZE,
  },
  overflowRow: {
    alignItems: 'flex-end',
    bottom: -ICON_OVERFLOW,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    left: UI_SIZES.spacing.big,
    position: 'absolute',
    right: UI_SIZES.spacing.big,
  },
});

/**
 * Type-dependent styles, computed once at module load: `DISCUSSION_TYPE_CONFIG` is static,
 * so there is nothing to memoize at render time.
 */
export const TYPE_STYLES = Object.fromEntries(
  (Object.keys(DISCUSSION_TYPE_CONFIG) as DiscussionIcon[]).map(type => {
    const { color } = DISCUSSION_TYPE_CONFIG[type];
    return [
      type,
      {
        container: [styles.container, { backgroundColor: color.pale, borderTopColor: color.light }],
        iconSquare: [styles.iconSquare, { borderColor: color.pale }],
      },
    ];
  }),
) as Record<DiscussionIcon, { container: StyleProp<ViewStyle>; iconSquare: StyleProp<ViewStyle> }>;

export default styles;
