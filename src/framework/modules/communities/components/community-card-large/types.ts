import { ImageSourcePropType } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

export interface CommunityCardLargeProps {
  image?: ImageSourcePropType;
  membersCount?: number;
  title?: string;
  senderId: string;
  senderName: string;
  role: MembershipRole;
}
