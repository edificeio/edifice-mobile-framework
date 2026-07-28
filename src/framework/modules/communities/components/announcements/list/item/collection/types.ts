import { ViewProps } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

import { CollectAnnouncementDetails } from '~/framework/modules/communities/service/announcements';

export interface CollectionItemProps {
  announcement: CollectAnnouncementDetails<number>;
  style?: ViewProps['style'];
  userRole?: MembershipRole;
}
