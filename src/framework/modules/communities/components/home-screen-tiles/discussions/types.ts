import { MembershipRole } from '@edifice.io/community-client-rest-rn';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export interface DiscussionsTileProps {
  communityId: number;
  hasUnreadMessages: boolean;
  navigation: NativeStackNavigationProp<CommunitiesNavigationParams>;
  totalDiscussions: number;
  userRole?: MembershipRole;
}
