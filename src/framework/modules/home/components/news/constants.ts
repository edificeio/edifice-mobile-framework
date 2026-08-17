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

export const PREVIEW_IMAGES = 2;

export const IMAGE_HEIGHT = getScaleWidth(75);

// width a lone image keeps, so it never spans the whole card.
export const SINGLE_IMAGE_WIDTH = getScaleWidth(102);
export const MORE_IMAGES_WIDTH = getScaleWidth(52);

export const NEWS_BACKGROUNDS = {
  headline: theme.palette.complementary.yellow.pale,
  standard: theme.palette.status.failure.pale,
};
