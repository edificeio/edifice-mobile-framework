import type { HomeNewsItem } from '~/framework/modules/news/components/home-section/types';

export interface NewsCardProps {
  item: HomeNewsItem;
  onPress: (item: HomeNewsItem) => void;
}
