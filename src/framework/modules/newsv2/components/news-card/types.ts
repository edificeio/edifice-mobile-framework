import { ImageSourcePropType } from 'react-native';

import { NewsItem } from '~/framework/modules/newsv2/model';

export interface NewsCardProps {
  news: NewsItem;
  thread: { icon: ImageSourcePropType | null; title: string };
  onPress: () => void;
}
