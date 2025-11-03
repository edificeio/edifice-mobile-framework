import { CommunityResponseDto, MembershipRole } from '@edifice.io/community-client-rest-rn';

export interface CommunityWelcomeBottomSheetModalProps {
  title: CommunityResponseDto['title'];
  role: MembershipRole;
}
