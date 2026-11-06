import type { DiscussionDto } from '@edifice.io/community-client-rest-rn';

import type { AuthActiveAccount } from '~/framework/modules/auth/model';

/**
 * Where the unread messages of the discussion start:
 * - `never-visited`: the user has never opened the discussion (or the unread count failed)
 * - `all-read`: no message has been posted since the last visit
 * - `unread`: `index` is the index of the first message posted since the last visit
 */
export type FirstUnreadMessage = { status: 'all-read' } | { status: 'never-visited' } | { index: number; status: 'unread' };

export interface UseFirstUnreadMessage {
  /** undefined until `resolveFirstUnread` has resolved */
  firstUnread?: FirstUnreadMessage;
  /** Counts the messages of the discussion and the unread ones, to compute where the unread messages start */
  resolveFirstUnread: () => Promise<{ firstUnread: FirstUnreadMessage; total: number }>;
}

export interface UseFirstUnreadMessageParams {
  communityId: number;
  discussion?: DiscussionDto;
  discussionId: number;
  session: AuthActiveAccount;
}
