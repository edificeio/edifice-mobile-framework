import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { DiscussionIcon } from '@edifice.io/community-client-rest-rn';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { getLineHeight } from '~/framework/components/text';
import { DISCUSSION_TYPE_CONFIG } from '~/framework/modules/communities/utils';

export const ICON_BIG_SIZE = getScaleWidth(56);
export const ICON_SMALL_SIZE = getScaleWidth(44);
export const ICON_SCALE = ICON_SMALL_SIZE / ICON_BIG_SIZE;
export const ICON_LEFT = UI_SIZES.spacing.big;
export const ICON_OVERFLOW = UI_SIZES.spacing.small + UI_SIZES.spacing.minor;

/** Room the expanded band keeps under the title for the author line, the date and the icon. */
const BIG_BOTTOM_RESERVE = UI_SIZES.spacing.major;

export const TEXT_LEFT_BIG = ICON_LEFT + ICON_BIG_SIZE + UI_SIZES.spacing.small;
export const TEXT_LEFT_SMALL = ICON_LEFT + ICON_SMALL_SIZE + UI_SIZES.spacing.minor;

const AUTHOR_HEIGHT = getLineHeight('Normal');
const SMALL_TITLE_HEIGHT = getLineHeight('Medium');
const SMALL_PADDING_VERTICAL = UI_SIZES.spacing.minor;
const SMALL_CONTENT_HEIGHT = Math.max(ICON_SMALL_SIZE, SMALL_TITLE_HEIGHT + AUTHOR_HEIGHT);

export const COLLAPSIBLE_SMALL_HEIGHT = 2 * SMALL_PADDING_VERTICAL + SMALL_CONTENT_HEIGHT;
export const ICON_SMALL_TOP = SMALL_PADDING_VERTICAL + (SMALL_CONTENT_HEIGHT - ICON_SMALL_SIZE) / 2;
const SMALL_TITLE_TOP = SMALL_PADDING_VERTICAL + (SMALL_CONTENT_HEIGHT - SMALL_TITLE_HEIGHT - AUTHOR_HEIGHT) / 2;
export const SMALL_AUTHOR_TOP = SMALL_TITLE_TOP + SMALL_TITLE_HEIGHT;
export const TITLE_FADE_OUT_END = 0.45;
export const TITLE_FADE_IN_START = 0.45;
export const DATE_FADE_END = 0.35;
export const TITLE_RISE = UI_SIZES.spacing.minor;

const styles = StyleSheet.create({
  authorAndDateColumn: {
    bottom: -ICON_OVERFLOW,
    left: TEXT_LEFT_BIG,
    position: 'absolute',
    right: UI_SIZES.spacing.big,
  },
  authorAndDateContent: {
    gap: UI_SIZES.spacing.tinyExtra,
  },
  authorRegular: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  band: {
    borderTopWidth: UI_SIZES.border.thin,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  collapsibleArea: {
    paddingBottom: BIG_BOTTOM_RESERVE,
    paddingTop: UI_SIZES.spacing.medium,
  },
  collapsibleAreaWithStatus: {
    paddingTop: UI_SIZES.spacing.small,
  },
  date: {
    color: theme.palette.grey.graphite,
  },
  headerContent: {
    marginTop: UI_SIZES.border.thin,
  },
  iconSquare: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.newCard,
    borderWidth: UI_SIZES.border.small,
    bottom: -ICON_OVERFLOW,
    height: ICON_BIG_SIZE,
    justifyContent: 'center',
    left: ICON_LEFT,
    position: 'absolute',
    width: ICON_BIG_SIZE,
  },
  overlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  /** In flow: this is what gives the collapsible area its height. */
  titleBig: {
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  titleSmall: {
    left: TEXT_LEFT_SMALL,
    position: 'absolute',
    right: UI_SIZES.spacing.big,
    top: SMALL_TITLE_TOP,
  },
});

export const COLLAPSIBLE_AREA_WITH_STATUS_STYLE = [styles.collapsibleArea, styles.collapsibleAreaWithStatus];

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
        band: [styles.band, { backgroundColor: color.pale, borderTopColor: color.light }],
        iconSquare: [styles.iconSquare, { borderColor: color.pale }],
      },
    ];
  }),
) as Record<DiscussionIcon, { band: StyleProp<ViewStyle>; iconSquare: StyleProp<ViewStyle> }>;

export default styles;
