import { MembershipRole } from '@edifice.io/community-client-rest-rn';

export interface CommunityInfoBottomSheetProps {
  data: {
    title?: string;
    image?: string;
    totalMembers?: number;
    senderId: string;
    senderName: string;
    role: MembershipRole;
    welcomeNote?: string;
  };
}
