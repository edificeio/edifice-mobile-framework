import { ImageSourcePropType } from 'react-native';

import { NewsItem } from '~/framework/modules/news/model';

export interface NewsCardProps {
  news: NewsItem;
  thread: { icon: ImageSourcePropType | null; title: string };
  onPress: () => void;
}
