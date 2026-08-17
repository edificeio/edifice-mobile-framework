import type { HomeNewsItem } from '~/framework/modules/home/components/news/types';

export interface NewsCardProps {
  item: HomeNewsItem;
  onPress: (item: HomeNewsItem) => void;
}
