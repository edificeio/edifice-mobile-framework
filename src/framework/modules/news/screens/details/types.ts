import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AudienceReferer, AudienceViews } from '~/framework/modules/audience/types';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { NewsCommentItem, NewsItem, NewsItemDetails } from '~/framework/modules/news/model';
import { NewsNavigationParams, newsRouteNames } from '~/framework/modules/news/navigation';
import { INewsNotification } from '~/framework/modules/news/notif-handler';
import { NewsThreadItemReduce } from '~/framework/modules/news/screens/home/types';

export interface NewsDetailsScreenDataProps {
  session?: AuthLoggedAccount;
}

export interface NewsDetailsScreenEventProps {
  handleGetNewsItem(infoId: number): Promise<NewsItemDetails>;
  handleGetNewsItemComments(newsItemId: number): Promise<NewsCommentItem[]>;
  handleDeleteInfo(threadId: number, infoId: number): Promise<number | undefined>;
  handleDeleteComment(infoId: number, commentId: number): Promise<number | undefined>;
  handlePublishComment(infoId: number, comment: string): Promise<number | undefined>;
  handleEditComment(infoId: number, comment: string, commentId: number): Promise<number | undefined>;
  handleViewsCount(referer: Omit<AudienceReferer, 'resourceType'>): Promise<AudienceViews>;
}

export interface NewsDetailsScreenNavParams {
  news?: NewsItem;
  thread?: NewsThreadItemReduce;
  page?: number;
  notification?: INewsNotification;
}

export type NewsDetailsScreenProps = NewsDetailsScreenDataProps &
  NewsDetailsScreenEventProps &
  NativeStackScreenProps<NewsNavigationParams, typeof newsRouteNames.details>;
