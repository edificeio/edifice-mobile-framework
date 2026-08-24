import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { PLACEHOLDER_LINE_HEIGHT } from '~/framework/modules/home/components/constants';
import { MEDIA_GAP, MEDIA_HEIGHT } from '~/framework/modules/home/components/media-preview/constants';

import { CAROUSEL_EDGE_INSET, CAROUSEL_GAP } from '../carousel/constants';
import { CARD_HEIGHT, CARD_WIDTH, THUMBNAIL_SIZE } from '../constants';

export default StyleSheet.create({
  body: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.palette.grey.fog,
    flexGrow: 0,
    flexShrink: 0,
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
  },
  image: {
    borderRadius: UI_SIZES.radius.medium,
    flex: 1,
    height: MEDIA_HEIGHT,
    marginBottom: 0,
  },
  images: {
    flexDirection: 'row',
    gap: MEDIA_GAP,
  },
  line: {
    height: PLACEHOLDER_LINE_HEIGHT,
    marginBottom: UI_SIZES.spacing.minor,
  },
  row: {
    flexDirection: 'row',
    gap: CAROUSEL_GAP,
    // Reaches the edge of the screen like the real row, so the second card is cut there.
    marginRight: -CAROUSEL_EDGE_INSET,
    overflow: 'hidden',
  },
  threadTitle: {
    backgroundColor: theme.palette.grey.cloudy,
    height: PLACEHOLDER_LINE_HEIGHT,
    marginBottom: 0,
  },
  thumbnail: {
    backgroundColor: theme.palette.grey.grey,
    borderRadius: UI_SIZES.radius.medium,
    height: THUMBNAIL_SIZE,
    marginBottom: 0,
    width: THUMBNAIL_SIZE,
  },
});
