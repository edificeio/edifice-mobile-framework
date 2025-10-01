import { ViewProps } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import { AudienceProps } from '~/framework/modules/audience/components/types';
import { INotificationMedia } from '~/framework/util/notifications';

export interface PostDetailsProps {
  audience?: AudienceProps;
  author: {
    userId: string;
    username: string;
  };
  content: string;
  date?: Temporal.Instant;
  header?: React.ReactElement;
  media?: INotificationMedia[];
  resourceId: string;
  style?: ViewProps['style'];
  title?: string;
}
