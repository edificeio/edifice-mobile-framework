import { MembershipClient } from '@edifice.io/community-client-rest-rn';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/communities/module-config';
import { accountApi } from '~/framework/util/transport';

export const isFirstCommunityVisit = async (session: AuthActiveAccount, communityId: number): Promise<boolean> => {
  const { items } = await accountApi(session, moduleConfig, MembershipClient).getMembers(communityId, {
    page: 1,
    size: 1,
    userEntId: session.user.id,
  });

  return !items.at(0)?.lastVisitAnnouncementsDate;
};
