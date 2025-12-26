import { NewsItem } from '~/framework/modules/news/model';
import { NewsThreadItemReduce } from '~/framework/modules/news/screens/home';

export interface NewsHeaderProps {
  news?: NewsItem;
  thread?: NewsThreadItemReduce;
  commentsCount?: number;
}
