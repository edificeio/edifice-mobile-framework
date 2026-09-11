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
  containerWithStatus: {
    paddingTop: 0,
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
  /**
   * Keep the 4 borders with same width AND color, otherwise Android ignores the dashed border
   * The tab hangs from the top of the header, so the top border is hidden with statusBarClip
   */
  statusTab: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.grey.white,
    borderBottomLeftRadius: UI_SIZES.radius.card,
    borderBottomRightRadius: UI_SIZES.radius.card,
    borderWidth: UI_SIZES.border.small,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    marginTop: -UI_SIZES.border.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  statusTabClip: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  statusTabHidden: {
    borderStyle: 'dashed',
  },
  statusTabText: {
    color: theme.palette.grey.graphite,
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
        statusTab: [styles.statusTab, { borderColor: color.light }],
      },
    ];
  }),
) as Record<DiscussionIcon, { container: StyleProp<ViewStyle>; iconSquare: StyleProp<ViewStyle>; statusTab: StyleProp<ViewStyle> }>;

export default styles;
