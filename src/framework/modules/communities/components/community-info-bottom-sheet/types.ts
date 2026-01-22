import { ImageURISource } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

export interface CommunityInfoBottomSheetProps {
  data: {
    title?: string;
    image?: ImageURISource[];
    totalMembers?: number;
    senderId: string;
    senderName: string;
    role: MembershipRole;
    welcomeNote?: string;
  };
}
