import { DiscussionClient, DiscussionDto, UserDto } from '@edifice.io/community-client-rest-rn';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/communities/module-config';
import { accountApi } from '~/framework/util/transport';

/**
 * Extension of DiscussionDto type : TODO ask a fix to backend dev
 * - firstUsers : this field is misspelled in the client's DiscussionDto type (fisrtUsers) but correctly spelled in the response
 * - hasUnreadMessages and lastVisitedTime are missing from DiscussionDto type but present in the response
 */
export type DiscussionRuntimeExtras = {
  firstUsers: UserDto[];
  hasUnreadMessages: boolean;
  lastVisitedTime: string;
};

export type Discussion = DiscussionDto & DiscussionRuntimeExtras & { unreadCount: number };

export interface DiscussionsSummary {
  hasUnreadMessages: boolean;
  totalDiscussions: number;
}

/**
 * Le back renvoie les discussions contenant des nouveaux messages en premier
 * on récupère les premières discussions pour savoir si il y a au moins un message non lu, ainsi que le nombre total de discussions
 */
export const getDiscussionsSummary = async (session: AuthActiveAccount, communityId: number): Promise<DiscussionsSummary> => {
  const { items, meta } = await accountApi(session, moduleConfig, DiscussionClient).listDiscussions(communityId);

  return {
    hasUnreadMessages: (items as unknown as DiscussionRuntimeExtras[]).some(discussion => discussion.hasUnreadMessages),
    totalDiscussions: meta.totalItems,
  };
};

export const getDiscussions = async (
  session: AuthActiveAccount,
  communityId: number,
  page: number,
  size: number,
): Promise<{ discussions: Discussion[]; total: number }> => {
  const client = accountApi(session, moduleConfig, DiscussionClient);
  const { items, meta } = await client.listDiscussions(communityId, { page: page + 1, size });

  const discussions = await Promise.all(
    (items as unknown as (DiscussionDto & DiscussionRuntimeExtras)[]).map(async discussion => {
      let unreadCount = 0;
      if (discussion.hasUnreadMessages) {
        const { count } = await client.countMessages(
          communityId,
          discussion.id,
          new Date(discussion.lastVisitedTime).toISOString() as unknown as Date,
        );
        unreadCount = count;
      }
      return { ...discussion, unreadCount };
    }),
  );

  return { discussions, total: meta.totalItems };
};
