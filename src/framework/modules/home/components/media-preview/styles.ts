import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

import { MEDIA_GAP, MEDIA_HEIGHT, MORE_MEDIA_WIDTH, SINGLE_MEDIA_WIDTH } from './constants';

export default StyleSheet.create({
  media: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.medium,
    flex: 1,
    height: MEDIA_HEIGHT,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mediaAlone: {
    flex: 0,
    width: SINGLE_MEDIA_WIDTH,
  },
  mediaImage: {
    height: '100%',
    width: '100%',
  },
  moreCount: {
    color: theme.palette.grey.white.toString(),
  },
  moreMedia: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.medium,
    height: MEDIA_HEIGHT,
    justifyContent: 'center',
    overflow: 'hidden',
    width: MORE_MEDIA_WIDTH,
  },
  moreOverlay: {
    backgroundColor: theme.palette.grey.black.toString(),
    opacity: 0.5,
  },
  play: {
    position: 'absolute',
  },
  playIcon: {
    color: theme.palette.grey.white.toString(),
  },
  row: {
    flexDirection: 'row',
    gap: MEDIA_GAP,
  },
});
