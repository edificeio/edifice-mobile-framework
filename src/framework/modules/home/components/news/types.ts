import type { NewsItem } from '~/framework/modules/news/model';
import type { NewsThreadItemReduce } from '~/framework/modules/news/screens/home/types';

export interface HomeNewsItem {
  news: NewsItem;
  thread: NewsThreadItemReduce;
}
