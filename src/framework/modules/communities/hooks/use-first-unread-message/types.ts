import type { DiscussionDto } from '@edifice.io/community-client-rest-rn';

import type { AuthActiveAccount } from '~/framework/modules/auth/model';

/**
 * Where the unread messages of the discussion start:
 * - `pending`: the discussion, the unread count or the first page of messages isn't loaded yet
 * - `never-visited`: the user has never opened the discussion (or the unread count failed)
 * - `all-read`: no message has been posted since the last visit
 * - `unread`: `index` is the index of the first message posted since the last visit
 */
export type FirstUnreadMessage =
  | { status: 'all-read' }
  | { status: 'never-visited' }
  | { status: 'pending' }
  | { index: number; status: 'unread' };

export interface UseFirstUnreadMessageParams {
  communityId: number;
  discussion?: DiscussionDto;
  discussionId: number;
  messagesCount: number;
  session: AuthActiveAccount;
}
