import { MembershipRole } from '@edifice.io/community-client-rest-rn';

export interface CommunityCardLargeProps {
  image?: string;
  membersCount?: number;
  title?: string;
  senderId: string;
  senderName: string;
  role: MembershipRole;
}
