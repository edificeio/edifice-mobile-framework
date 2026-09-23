import { ImageURISource } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

export interface CommunityInfoBottomSheetProps {
  data: {
    hasJoinedWithCode: boolean;
    image?: ImageURISource[];
    role: MembershipRole;
    senderId: string;
    senderName: string;
    title?: string;
    totalMembers?: number;
    welcomeNote?: string;
  };
}
