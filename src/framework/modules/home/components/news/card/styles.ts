import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

import { CARD_HEIGHT, CARD_WIDTH, IMAGE_HEIGHT, MORE_IMAGES_WIDTH, SINGLE_IMAGE_WIDTH, THUMBNAIL_SIZE } from '../constants';

export default StyleSheet.create({
  body: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.large,
    flex: 1,
    gap: UI_SIZES.spacing.tiny,
    // The card holds its height, so anything too long is cut by the card, not drawn outside of it.
    overflow: 'hidden',
    padding: UI_SIZES.spacing.small,
  },
  card: {
    borderRadius: UI_SIZES.radius.extraLarge,
    gap: UI_SIZES.spacing.tiny,
    height: CARD_HEIGHT,
    padding: UI_SIZES.spacing.tiny,
    width: CARD_WIDTH,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  image: {
    borderRadius: UI_SIZES.radius.medium,
    flex: 1,
    height: IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  imageAlone: {
    flex: 0,
    width: SINGLE_IMAGE_WIDTH,
  },
  imageContent: {
    height: '100%',
    width: '100%',
  },
  images: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  moreCount: {
    color: theme.palette.grey.white.toString(),
  },
  moreImage: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.medium,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    overflow: 'hidden',
    width: MORE_IMAGES_WIDTH,
  },
  moreOverlay: {
    backgroundColor: theme.palette.grey.black.toString(),
    opacity: 0.5,
  },
  text: {
    color: theme.palette.grey.graphite.toString(),
  },
  textArea: {
    // Takes what the title leaves and what the images need, which fixes how many lines fit.
    flex: 1,
    overflow: 'hidden',
  },
  textAreaMeasured: {
    // Once the count is known the area hugs its text, so the images follow it instead of hanging
    // at the bottom of the card when the text is short or missing.
    flex: 0,
  },
  threadTitle: {
    // color: theme.palette.grey.black.toString(),
    flexShrink: 1,
  },
  thumbnail: {
    borderRadius: UI_SIZES.radius.medium,
    height: THUMBNAIL_SIZE,
    overflow: 'hidden',
    width: THUMBNAIL_SIZE,
  },
  thumbnailImage: {
    height: THUMBNAIL_SIZE,
    width: THUMBNAIL_SIZE,
  },
});
