import { ContentType, DiscussionClient, DiscussionDto, MessageDto, UserDto } from '@edifice.io/community-client-rest-rn';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/communities/module-config';
import { accountApi } from '~/framework/util/transport';

/**
 * Extension of DiscussionDto type : TODO ask a fix to backend dev
 * - firstUsers : this field is misspelled in the client's DiscussionDto type (fisrtUsers) but correctly spelled in the response
 * - hasUnreadMessages and lastVisitedTime are missing from DiscussionDto type but present in the response
 *   (lastVisitedTime is absent until the user's first visit of the discussion)
 */
export type DiscussionRuntimeExtras = {
  firstUsers: UserDto[];
  hasUnreadMessages: boolean;
  lastVisitedTime?: string;
};

export type Discussion = DiscussionDto & DiscussionRuntimeExtras & { unreadCount: number };

export interface DiscussionsSummary {
  hasUnreadMessages: boolean;
  totalDiscussions: number;
}
export const countUnreadMessages = async (
  session: AuthActiveAccount,
  communityId: number,
  discussionId: number,
  lastVisitedTime: string,
): Promise<number> => {
  const { count } = await accountApi(session, moduleConfig, DiscussionClient).countMessages(
    communityId,
    discussionId,
    new Date(lastVisitedTime),
  );
  return count;
};

export const getDiscussion = async (
  session: AuthActiveAccount,
  communityId: number,
  discussionId: number,
): Promise<DiscussionDto> => accountApi(session, moduleConfig, DiscussionClient).getDiscussion(communityId, discussionId);

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
      if (discussion.hasUnreadMessages && discussion.lastVisitedTime) {
        unreadCount = await countUnreadMessages(session, communityId, discussion.id, discussion.lastVisitedTime);
      }
      return { ...discussion, unreadCount };
    }),
  );

  return { discussions, total: meta.totalItems };
};

export const getDiscussionsSummary = async (session: AuthActiveAccount, communityId: number): Promise<DiscussionsSummary> => {
  const { items, meta } = await accountApi(session, moduleConfig, DiscussionClient).listDiscussions(communityId);

  return {
    hasUnreadMessages: (items as unknown as DiscussionRuntimeExtras[]).some(discussion => discussion.hasUnreadMessages),
    totalDiscussions: meta.totalItems,
  };
};

export const MESSAGES_PAGE_SIZE = 20;

export const getMessages = async (
  session: AuthActiveAccount,
  communityId: number,
  discussionId: number,
  page: number,
  size: number,
): Promise<{ messages: MessageDto[]; total: number }> => {
  const { items, meta } = await accountApi(session, moduleConfig, DiscussionClient).listMessages(communityId, discussionId, {
    page: page + 1,
    size,
  });

  return { messages: items, total: meta.totalItems };
};

export const createMessage = async (
  session: AuthActiveAccount,
  communityId: number,
  discussionId: number,
  content: string,
): Promise<MessageDto> =>
  accountApi(session, moduleConfig, DiscussionClient).createMessage(communityId, discussionId, {
    content,
    contentType: ContentType.HTML,
  });

export const updateMessage = async (
  session: AuthActiveAccount,
  communityId: number,
  discussionId: number,
  messageId: number,
  content: string,
): Promise<MessageDto> =>
  accountApi(session, moduleConfig, DiscussionClient).updateMessage(communityId, discussionId, messageId, {
    content,
    contentType: ContentType.HTML,
  });

export const deleteMessage = async (
  session: AuthActiveAccount,
  communityId: number,
  discussionId: number,
  messageId: number,
): Promise<void> => accountApi(session, moduleConfig, DiscussionClient).deleteMessage(communityId, discussionId, messageId);
