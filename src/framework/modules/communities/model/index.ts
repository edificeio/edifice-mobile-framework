/**
 * Data model for the module communities
 */

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

export const rolesI18n: Record<MembershipRole, string> = {
  [MembershipRole.ADMIN]: 'communities-role-admin',
  [MembershipRole.MEMBER]: 'communities-role-member',
};
