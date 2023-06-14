import { ImageSourcePropType } from 'react-native';

import { ThreadItemStatus } from '~/framework/modules/newsv2/components/thread-item';

export interface ThumbnailThreadProps {
  icon: ImageSourcePropType | null;
  status?: ThreadItemStatus;
  square?: boolean;
}
