import { ImageSourcePropType } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

export interface CommunityCardLargeProps {
  hasJoinedWithCode?: boolean;
  image?: ImageSourcePropType;
  membersCount?: number;
  role: MembershipRole;
  senderId: string;
  senderName: string;
  title?: string;
}
