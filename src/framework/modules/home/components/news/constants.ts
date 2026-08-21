import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { MEDIA_HEIGHT } from '~/framework/modules/home/components/media-preview/constants';
import { CAROUSEL_EDGE_INSET, CAROUSEL_GAP } from '~/framework/modules/home/components/news/carousel/constants';

export const NEWS_COUNT = 6;

export const TITLE_LINES = 2;

const TEXT_LINE_HEIGHT = TextSizeStyle.Normal.lineHeight;
const TITLE_LINE_HEIGHT = TextSizeStyle.Medium.lineHeight;

export const THUMBNAIL_SIZE = getScaleWidth(24);
export const THUMBNAIL_ICON_SIZE = getScaleWidth(16);

const NEXT_CARD_PEEK = UI_SIZES.spacing.big;

export const CARD_WIDTH = UI_SIZES.screen.width - 2 * CAROUSEL_EDGE_INSET - CAROUSEL_GAP - NEXT_CARD_PEEK;

export const CARD_HEIGHT = getScaleWidth(223);

export const CARD_SNAP_INTERVAL = CARD_WIDTH + CAROUSEL_GAP;

export const EMPTY_IMAGE_SIZE = getScaleWidth(75);

const HEADER_HEIGHT = THUMBNAIL_SIZE + 2 * UI_SIZES.spacing.tiny;

const BODY_HEIGHT = CARD_HEIGHT - 3 * UI_SIZES.spacing.tiny - HEADER_HEIGHT - 2 * UI_SIZES.spacing.small;

export const getTextLines = (withMedia: boolean) => {
  // A gap between the title, the text and the media.
  const gaps = UI_SIZES.spacing.tiny * (withMedia ? 2 : 1);
  const room = BODY_HEIGHT - gaps - TITLE_LINES * TITLE_LINE_HEIGHT - (withMedia ? MEDIA_HEIGHT : 0);
  return Math.max(0, Math.floor(room / TEXT_LINE_HEIGHT));
};

export const NEWS_BACKGROUNDS = {
  headline: theme.palette.complementary.yellow.pale,
  standard: theme.palette.status.failure.pale,
};
