import { DiscussionClient } from '@edifice.io/community-client-rest-rn';

import moduleConfig from '~/framework/modules/communities/module-config';
import { sessionApi } from '~/framework/util/transport';

export const hasDiscussions = async (communityId: number): Promise<boolean> => {
  const { meta } = await sessionApi(moduleConfig, DiscussionClient).listDiscussions(communityId, { page: 1, size: 1 });

  return meta.totalItems > 0;
};
