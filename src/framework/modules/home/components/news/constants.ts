import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { CAROUSEL_EDGE_INSET, CAROUSEL_GAP } from '~/framework/modules/home/components/news/carousel/constants';

export const NEWS_COUNT = 6;

export const TITLE_LINES = 2;

export const TEXT_LINE_HEIGHT = TextSizeStyle.Normal.lineHeight;

export const THUMBNAIL_SIZE = getScaleWidth(24);
export const THUMBNAIL_ICON_SIZE = getScaleWidth(16);

const NEXT_CARD_PEEK = UI_SIZES.spacing.big;

export const CARD_WIDTH = UI_SIZES.screen.width - 2 * CAROUSEL_EDGE_INSET - CAROUSEL_GAP - NEXT_CARD_PEEK;

export const CARD_HEIGHT = getScaleWidth(223);

/** Drawing of the empty screen. */
export const EMPTY_IMAGE_SIZE = getScaleWidth(75);

export const NEWS_BACKGROUNDS = {
  headline: theme.palette.complementary.yellow.pale,
  standard: theme.palette.status.failure.pale,
};
