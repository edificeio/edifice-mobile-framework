import { ViewProps } from 'react-native';

import { PostDetailsProps } from '~/framework/modules/communities/components/announcements/post/details/types';

export interface AnnouncementListItemProps {
  announcement: PostDetailsProps;
  style?: ViewProps['style'];
}
