import type { HomeNewsItem } from '~/framework/modules/home/components/news/types';

export interface NewsSectionProps {
  news: HomeNewsItem[];
  /** Reading the news is a right of its own, without it the zone does not exist. */
  canView: boolean;
  loading: boolean;
  onPressItem: (item: HomeNewsItem) => void;
  onSeeMore: () => void;
}
