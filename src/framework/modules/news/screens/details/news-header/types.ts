import { NewsThreadItemReduce } from '../../home';

import { NewsItem } from '~/framework/modules/news/model';

export interface NewsHeaderProps {
  news?: NewsItem;
  thread?: NewsThreadItemReduce;
  commentsCount?: number;
}
