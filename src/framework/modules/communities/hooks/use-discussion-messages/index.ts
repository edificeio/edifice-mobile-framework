import * as React from 'react';

import { LOADING_ITEM_DATA, PaginatedListItem, staleOrSplice } from '~/framework/components/list/paginated-list';
import { DiscussionMessage, toDeletedMessage, toDiscussionMessage } from '~/framework/modules/communities/adapter';
import { FirstUnreadMessage, useFirstUnreadMessage } from '~/framework/modules/communities/hooks/use-first-unread-message';
import { countMessages, getMessages, MESSAGES_PAGE_SIZE } from '~/framework/modules/communities/service/discussions';

import { ScrollTarget, UseDiscussionMessages, UseDiscussionMessagesParams } from './types';

// Below this number of messages above the latest one in its page, the previous page is loaded too, so that the screen
// doesn't open on placeholders
const MIN_MESSAGES_ABOVE_LATEST = MESSAGES_PAGE_SIZE / 2;

const getPage = (index: number) => Math.max(0, Math.floor(index / MESSAGES_PAGE_SIZE));

// Message to focus on list opening (first unread, last one or first one)
const getInitialTarget = (firstUnread: FirstUnreadMessage): ScrollTarget | undefined => {
  if (firstUnread.status === 'unread') return firstUnread.index;
  return firstUnread.status === 'all-read' ? 'end' : undefined;
};

/**
 * Variant of `staleOrSplice` that doesn't reset the list when new messages are posted while it is displayed.
 *
 * `staleOrSplice` turns every loaded item back into a placeholder as soon as the total changes, which would make the
 * whole discussion blink and reload each time someone posts a message. Here, a growing total keeps the loaded messages
 * and only appends placeholders at the end: messages are sorted chronologically and never removed (deletion only flags
 * them, the total still counts them), so new ones always come last and the index of the loaded ones doesn't change.
 * A full reload or a shrinking total (unexpected list) still resets everything, like `staleOrSplice`.
 */
function mergeMessagesPage({
  newData,
  previousData,
  reloadAll,
  start,
  total,
}: Parameters<typeof staleOrSplice<DiscussionMessage>>[0]): PaginatedListItem<DiscussionMessage>[] {
  if (reloadAll || total < previousData.length) return staleOrSplice({ newData, previousData, reloadAll: true, start, total });
  const mergedData = [...previousData, ...new Array(total - previousData.length).fill(LOADING_ITEM_DATA)];
  mergedData.splice(start, newData.length, ...newData);
  return mergedData;
}

/** Paginated messages of a discussion, opened on the first unread one, or on the latest one when all have been read */
export function useDiscussionMessages({
  communityId,
  discussion,
  discussionId,
  refreshDiscussion,
  session,
}: UseDiscussionMessagesParams): UseDiscussionMessages {
  const [messages, setMessages] = React.useState<PaginatedListItem<DiscussionMessage>[]>([]);
  const messagesRef = React.useRef(messages);
  messagesRef.current = messages;

  const { firstUnread, resolveFirstUnread } = useFirstUnreadMessage({ communityId, discussion, discussionId, session });
  const firstUnreadIndex = firstUnread?.status === 'unread' ? firstUnread.index : undefined;

  const fetchMessagesPage = React.useCallback(
    async (page: number) => {
      const { messages: loadedMessages, total } = await getMessages(session, communityId, discussionId, page, MESSAGES_PAGE_SIZE);
      return { newData: loadedMessages.map(toDiscussionMessage), start: page * MESSAGES_PAGE_SIZE, total };
    },
    [communityId, discussionId, session],
  );

  const loadLastPage = React.useCallback(async () => {
    const total = await countMessages(session, communityId, discussionId);
    const result = await fetchMessagesPage(getPage(total - 1));
    setMessages(previousData => mergeMessagesPage({ ...result, previousData }));
  }, [communityId, discussionId, fetchMessagesPage, session]);

  // The list is mounted once the first load is done: loading the page of the initial target first lets the list open
  // directly on it with `initialScrollIndex`, instead of scrolling after the page 0 is displayed
  const isInitialLoadRef = React.useRef(true);
  const initialTargetRef = React.useRef<ScrollTarget>(undefined);
  const [initialScrollIndex, setInitialScrollIndex] = React.useState<number>();
  const loadInitialMessages = React.useCallback(async () => {
    const { firstUnread: firstUnreadMessage, total } = await resolveFirstUnread();
    // If there is no replies : open on top of the header (even if the message is very long)
    const target = total > 1 ? getInitialTarget(firstUnreadMessage) : undefined;
    const index = target === 'end' ? total - 1 : (target ?? 0);
    const targetPage = getPage(index);
    const needsPreviousPage =
      target === 'end' && index >= MESSAGES_PAGE_SIZE && index % MESSAGES_PAGE_SIZE < MIN_MESSAGES_ABOVE_LATEST;
    const pages = await Promise.all((needsPreviousPage ? [targetPage - 1, targetPage] : [targetPage]).map(fetchMessagesPage));
    initialTargetRef.current = target;
    setInitialScrollIndex(target === undefined ? undefined : index);
    setMessages(
      pages.reduce<PaginatedListItem<DiscussionMessage>[]>(
        (previousData, page) => mergeMessagesPage({ ...page, previousData }),
        [],
      ),
    );
  }, [fetchMessagesPage, resolveFirstUnread]);

  const onPageReached = React.useCallback<UseDiscussionMessages['onPageReached']>(
    async (page, reloadAll) => {
      if (reloadAll && isInitialLoadRef.current) {
        await Promise.all([refreshDiscussion(true), loadInitialMessages()]);
        isInitialLoadRef.current = false;
        return;
      }
      if (reloadAll) await refreshDiscussion(false);
      const result = await fetchMessagesPage(page);
      setMessages(previousData => mergeMessagesPage({ ...result, previousData, reloadAll }));
    },
    [fetchMessagesPage, loadInitialMessages, refreshDiscussion],
  );

  const consumeInitialTarget = React.useCallback(() => {
    const target = initialTargetRef.current;
    initialTargetRef.current = undefined;
    return target;
  }, []);

  const isLastPageLoaded = React.useCallback(() => messagesRef.current.at(-1) !== LOADING_ITEM_DATA, []);

  const reloadMessagePage = React.useCallback(
    async (messageId: number) => {
      const index = messagesRef.current.findIndex(message => message !== LOADING_ITEM_DATA && message.id === messageId.toString());
      if (index !== -1) await onPageReached(getPage(index));
    },
    [onPageReached],
  );

  const markMessageAsDeleted = React.useCallback((id: string) => {
    setMessages(previous =>
      previous.map(message => (message !== LOADING_ITEM_DATA && message.id === id ? toDeletedMessage(message) : message)),
    );
  }, []);

  return {
    consumeInitialTarget,
    firstUnreadIndex,
    initialScrollIndex,
    isLastPageLoaded,
    loadLastPage,
    markMessageAsDeleted,
    messages,
    onPageReached,
    reloadMessagePage,
  };
}

export type { ScrollTarget } from './types';
