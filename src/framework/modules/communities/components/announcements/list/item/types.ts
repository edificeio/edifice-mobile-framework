import { ViewProps } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { AnnouncementDetails } from '~/framework/modules/communities/service/announcements';

export interface AnnouncementListItemProps {
  announcement: AnnouncementDetails<number>;
  session: AuthActiveAccount;
  style?: ViewProps['style'];
  userRole?: MembershipRole;
}
