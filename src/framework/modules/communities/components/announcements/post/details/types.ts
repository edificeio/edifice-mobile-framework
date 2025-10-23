import { ViewProps } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import { AudienceProps } from '~/framework/modules/audience/components/types';
import { Media } from '~/framework/util/media/index';

export interface PostDetailsProps<IdType extends string | number> {
  audience?: AudienceProps;
  author: {
    userId: string;
    username: string;
  };
  content: string;
  date?: Temporal.Instant;
  header?: React.ReactElement;
  media?: Media[];
  resourceId: IdType;
  style?: ViewProps['style'];
  title?: string;
}
