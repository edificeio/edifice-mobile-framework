import type { HomeNewsItem } from '~/framework/modules/home/components/news/types';

export interface NewsSectionProps {
  news: HomeNewsItem[];
  loading: boolean;
  onPressItem: (item: HomeNewsItem) => void;
  onSeeMore: () => void;
}
