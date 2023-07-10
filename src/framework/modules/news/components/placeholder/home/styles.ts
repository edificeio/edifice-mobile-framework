import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { WIDTH_THUMBNAIL_THREAD_ITEM } from '~/framework/modules/news/components/thread-item';

export default StyleSheet.create({
  //GLOBAL
  h18: {
    height: 18,
  },
  h14: {
    height: 14,
  },
  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
  //DETAILS
  page: {
    padding: UI_SIZES.spacing.medium,
  },
  threads: {
    marginBottom: UI_SIZES.spacing.big,
    flexDirection: 'row',
  },
  itemThread: {
    alignItems: 'center',
    marginRight: UI_SIZES.spacing.big,
  },
  itemThread_media: {
    width: WIDTH_THUMBNAIL_THREAD_ITEM,
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    marginBottom: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.medium,
  },
  cardNews: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.small,
    marginBottom: UI_SIZES.spacing.big,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 1,
    borderColor: theme.palette.grey.pearl,
  },
  cardNews_top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.small,
  },
  cardNews_thumbnail: {
    marginRight: UI_SIZES.spacing.minor,
  },
  cardNews_threadText: {
    marginBottom: 0,
  },
  cardNews_date: {
    marginBottom: 16,
  },
  cardNews_lastLine: {
    marginBottom: 0,
  },
});
