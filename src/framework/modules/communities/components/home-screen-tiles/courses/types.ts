import { MembershipRole } from '@edifice.io/community-client-rest-rn';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export interface CoursesTileProps {
  communityId: number;
  navigation: NativeStackNavigationProp<CommunitiesNavigationParams>;
  platformUrl: string;
  spotlightedCourseId?: string;
  userRole?: MembershipRole;
}
