import * as React from 'react';

import { LOADING_ITEM_DATA, PaginatedListItem, staleOrSplice } from '~/framework/components/list/paginated-list';
import { DiscussionMessage, toDeletedMessage, toDiscussionMessage } from '~/framework/modules/communities/adapter';
import { FirstUnreadMessage, useFirstUnreadMessage } from '~/framework/modules/communities/hooks/use-first-unread-message';
import { ScrollTarget } from '~/framework/modules/communities/hooks/use-scroll-and-stick-to-target';
import { countMessages, getMessages, MESSAGES_PAGE_SIZE } from '~/framework/modules/communities/service/discussions';

import { UseDiscussionMessages, UseDiscussionMessagesParams } from './types';

// Below this number of messages above the latest one in its page, the previous page is loaded too, so that the screen
// doesn't open on placeholders
const MIN_MESSAGES_ABOVE_LATEST = MESSAGES_PAGE_SIZE / 2;

const getPage = (index: number) => Math.max(0, Math.floor(index / MESSAGES_PAGE_SIZE));

// Message to focus on list opening (first unread, last or first one)
const getInitialTarget = (firstUnread: FirstUnreadMessage): ScrollTarget | undefined => {
  if (firstUnread.status === 'unread') return firstUnread.index;
  return firstUnread.status === 'all-read' ? 'end' : undefined;
};

/**
 * Like `staleOrSplice`, but a growing total keeps the loaded messages: they are never removed (deletion only flags them)
 * and new ones are appended, so their index doesn't change.
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
    // The first message is displayed by the header: without replies, the discussion opens on its top, like a first visit
    const target = total > 1 ? getInitialTarget(firstUnreadMessage) : undefined;
    const index = target === 'end' ? total - 1 : (target ?? 0);
    const pages = [await fetchMessagesPage(getPage(index))];
    if (target === 'end' && index >= MESSAGES_PAGE_SIZE && index % MESSAGES_PAGE_SIZE < MIN_MESSAGES_ABOVE_LATEST)
      pages.unshift(await fetchMessagesPage(getPage(index) - 1));
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
        // The messages don't depend on the discussion: both are loaded at the same time
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

  // The unloaded pages are placeholders
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
