import { MembershipRole } from '@edifice.io/community-client-rest-rn';

import { AccountType } from '~/framework/modules/auth/model';

export interface MemberListItemProps {
  name: string;
  profileType: AccountType;
  role: MembershipRole;
}
