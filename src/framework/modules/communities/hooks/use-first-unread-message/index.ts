import * as React from 'react';

import { countUnreadMessages, Discussion } from '~/framework/modules/communities/service/discussions';

import { FirstUnreadMessage, UseFirstUnreadMessageParams } from './types';

export function useFirstUnreadMessage({
  communityId,
  discussion,
  discussionId,
  messagesCount,
  session,
}: UseFirstUnreadMessageParams): FirstUnreadMessage {
  const lastVisitRef = React.useRef<Partial<Pick<Discussion, 'hasUnreadMessages' | 'lastVisitedTime' | 'unreadCount'>>>(undefined);
  if (discussion && !lastVisitRef.current) {
    const { hasUnreadMessages, lastVisitedTime, unreadCount } = discussion as Partial<Discussion>;
    lastVisitRef.current = { hasUnreadMessages, lastVisitedTime, unreadCount };
  }

  // Number of messages posted since the last visit. Reuses the count of the discussions list when available.
  // undefined: not known yet, null: the count failed
  const hasDiscussion = !!discussion;
  const [unreadCount, setUnreadCount] = React.useState<number | null>();
  React.useEffect(() => {
    const lastVisit = lastVisitRef.current;
    if (!hasDiscussion || !lastVisit?.hasUnreadMessages || !lastVisit.lastVisitedTime) return;
    if (lastVisit.unreadCount) {
      setUnreadCount(lastVisit.unreadCount);
      return;
    }
    let cancelled = false;
    countUnreadMessages(session, communityId, discussionId, lastVisit.lastVisitedTime)
      .then(count => {
        if (!cancelled) setUnreadCount(count);
      })
      .catch(e => {
        console.error('Error while counting community discussion unread messages', e);
        if (!cancelled) setUnreadCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [communityId, discussionId, hasDiscussion, session]);

  const [firstUnreadIndex, setFirstUnreadIndex] = React.useState<number>();
  React.useEffect(() => {
    if (!unreadCount || !messagesCount || firstUnreadIndex !== undefined) return;
    setFirstUnreadIndex(Math.max(0, messagesCount - unreadCount));
  }, [firstUnreadIndex, messagesCount, unreadCount]);

  const lastVisit = lastVisitRef.current;
  let status: Exclude<FirstUnreadMessage['status'], 'unread'> | undefined;
  if (!lastVisit) status = 'pending';
  else if (!lastVisit.lastVisitedTime || unreadCount === null) status = 'never-visited';
  else if (!lastVisit.hasUnreadMessages || unreadCount === 0) status = 'all-read';
  else if (firstUnreadIndex === undefined) status = 'pending';

  // Memoized on primitives: the returned object only changes when the result changes
  return React.useMemo<FirstUnreadMessage>(
    () =>
      status || firstUnreadIndex === undefined ? { status: status ?? 'pending' } : { index: firstUnreadIndex, status: 'unread' },
    [firstUnreadIndex, status],
  );
}
