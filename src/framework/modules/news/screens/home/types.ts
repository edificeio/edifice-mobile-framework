import { ImageSourcePropType } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { NewsItem, NewsThreadItem, NewsThreadItemRights } from '~/framework/modules/news/model';
import { NewsNavigationParams, newsRouteNames } from '~/framework/modules/news/navigation';

export interface NewsHomeScreenDataProps {
  session?: AuthLoggedAccount;
}
export interface NewsHomeScreenEventProps {
  handleGetNewsThreads(): Promise<NewsThreadItem[]>;
  handleGetNewsItems(page: number, threadId?: number, isRefresh?: boolean): Promise<NewsItem[]>;
}

export interface NewsHomeScreenNavParams {
  page?: number;
}

export type NewsHomeScreenProps = NewsHomeScreenDataProps &
  NewsHomeScreenEventProps &
  NativeStackScreenProps<NewsNavigationParams, typeof newsRouteNames.home>;

export interface NewsThreadItemReduce {
  icon: ImageSourcePropType | null;
  title: string;
  sharedRights: NewsThreadItemRights[];
  ownerId: string;
}
