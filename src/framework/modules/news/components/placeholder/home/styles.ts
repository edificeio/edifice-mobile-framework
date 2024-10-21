import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { WIDTH_THUMBNAIL_THREAD_ITEM } from '~/framework/modules/news/components/thread-item';

export default StyleSheet.create({
  cardNews: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 1,
    marginBottom: UI_SIZES.spacing.big,
    padding: UI_SIZES.spacing.small,
  },

  cardNews_thumbnail: {
    marginRight: UI_SIZES.spacing.minor,
  },

  h14: {
    height: 14,
  },

  cardNews_date: {
    marginBottom: 16,
  },

  
cardNews_lastLine: {
    marginBottom: 0,
  },

  //GLOBAL
h18: {
    height: 18,
  },

  cardNews_threadText: {
    marginBottom: 0,
  },

  itemThread: {
    alignItems: 'center',
    marginRight: UI_SIZES.spacing.big,
  },

  cardNews_top: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.small,
  },
  
itemThread_media: {
    aspectRatio: UI_SIZES.aspectRatios.thumbnail,
    width: WIDTH_THUMBNAIL_THREAD_ITEM,
    borderRadius: UI_SIZES.radius.medium,
    marginBottom: UI_SIZES.spacing.minor,
  },
  //DETAILS
page: {
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
  threads: {
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.medium,
  },
});
