import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { NewsCommentItem, NewsItem } from '~/framework/modules/newsv2/model';
import { NewsNavigationParams, newsRouteNames } from '~/framework/modules/newsv2/navigation';
import { NewsThreadItemReduce } from '~/framework/modules/newsv2/screens/home/types';

export interface NewsDetailsScreenDataProps {
  session?: ISession;
}

export interface NewsDetailsScreenEventProps {
  handleGetNewsItemComments(newsItemId: number): Promise<NewsCommentItem[]>;
  handleDeleteInfo(threadId: number, infoId: number): Promise<number | undefined>;
  handleDeleteComment(infoId: number, commentId: number): Promise<number | undefined>;
}

export interface NewsDetailsScreenNavParams {
  news?: NewsItem;
  thread?: NewsThreadItemReduce;
}

export type NewsDetailsScreenProps = NewsDetailsScreenDataProps &
  NewsDetailsScreenEventProps &
  NativeStackScreenProps<NewsNavigationParams, typeof newsRouteNames.details>;
