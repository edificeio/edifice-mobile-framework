import { ImageSourcePropType } from 'react-native';

import { ThreadItemStatus } from '~/framework/modules/news/components/thread-item';

export interface ThumbnailThreadProps {
  icon: ImageSourcePropType | null;
  status?: ThreadItemStatus;
  square?: boolean;
}
