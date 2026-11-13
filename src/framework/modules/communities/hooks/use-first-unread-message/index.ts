import * as React from 'react';

import { countMessages, countUnreadMessages, DiscussionRuntimeExtras } from '~/framework/modules/communities/service/discussions';

import { FirstUnreadMessage, UseFirstUnreadMessage, UseFirstUnreadMessageParams } from './types';

export function useFirstUnreadMessage({
  communityId,
  discussion,
  discussionId,
  session,
}: UseFirstUnreadMessageParams): UseFirstUnreadMessage {
  // Kept from the first render: the discussion is fetched again on opening, and is then marked as visited
  const lastVisitRef = React.useRef<Partial<Pick<DiscussionRuntimeExtras, 'hasUnreadMessages' | 'lastVisitedTime'>>>(undefined);
  if (discussion && !lastVisitRef.current) {
    const { hasUnreadMessages, lastVisitedTime } = discussion as Partial<DiscussionRuntimeExtras>;
    lastVisitRef.current = { hasUnreadMessages, lastVisitedTime };
  }

  const [firstUnread, setFirstUnread] = React.useState<FirstUnreadMessage>();

  // Both counts are made together: the unread count of the discussions list can be outdated compared to the total
  const resolveFirstUnread = React.useCallback(async () => {
    const lastVisit = lastVisitRef.current;
    const lastVisitedTime = lastVisit?.hasUnreadMessages ? lastVisit.lastVisitedTime : undefined;
    const [total, unreadCount] = await Promise.all([
      countMessages(session, communityId, discussionId),
      lastVisitedTime
        ? countUnreadMessages(session, communityId, discussionId, lastVisitedTime).catch(e => {
            console.error('Error while counting community discussion unread messages', e);
            return null;
          })
        : undefined,
    ]);

    let result: FirstUnreadMessage;
    if (!lastVisit?.lastVisitedTime || unreadCount === null) result = { status: 'never-visited' };
    else if (!unreadCount) result = { status: 'all-read' };
    else result = { index: Math.max(0, total - unreadCount), status: 'unread' };
    setFirstUnread(result);
    return { firstUnread: result, total };
  }, [communityId, discussionId, session]);

  return { firstUnread, resolveFirstUnread };
}

export type { FirstUnreadMessage } from './types';
