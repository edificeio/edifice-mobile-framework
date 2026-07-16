import { DiscussionClient, DiscussionDto, UserDto } from '@edifice.io/community-client-rest-rn';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/communities/module-config';
import { accountApi, sessionApi } from '~/framework/util/transport';

export const hasDiscussions = async (communityId: number): Promise<boolean> => {
  const { meta } = await sessionApi(moduleConfig, DiscussionClient).listDiscussions(communityId, { page: 1, size: 1 });

  return meta.totalItems > 0;
};

/**
 * Extension du type DiscussionDto : TODO demander un fix au retour d'Hippo
 * - firstUsers : ce champ est mal orthographié dans le type DiscussionDto du client (fisrtUsers) mais bien écrit dans la réponse
 * - hasUnreadMessages et lastVisitedTime sont absents du type DiscussionDto mais présents dans la réponse
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

export const getDiscussions = async (session: AuthActiveAccount, communityId: number): Promise<Discussion[]> => {
  const client = accountApi(session, moduleConfig, DiscussionClient);
  const res = await client.listDiscussions(communityId);

  return Promise.all(
    (res.items as unknown as (DiscussionDto & DiscussionRuntimeExtras)[]).map(async discussion => {
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
};
