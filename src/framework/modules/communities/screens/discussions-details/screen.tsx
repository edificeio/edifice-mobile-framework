import * as React from 'react';
import { Alert, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';

import { FlashListRef } from '@shopify/flash-list';
import { useSharedValue } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import {
  DEFAULT_FLATLIST_PLACEHOLDER_ROWS,
  LOADING_ITEM_DATA,
  PaginatedFlashList,
  PaginatedFlashListProps,
  PaginatedListItem,
  staleOrSplice,
} from '~/framework/components/list/paginated-list';
import { BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { AccountType } from '~/framework/modules/auth/model';
import { withSession } from '~/framework/modules/auth/util';
import {
  CommentsThreadAddFormLoader,
  CommentsThreadInternals,
  CommentsThreadItemLoader,
} from '~/framework/modules/comments/components/comments-thread-internal';
import { CommentsThread } from '~/framework/modules/comments/components/comments-thread-internal/item';
import { DiscussionMessage, toDeletedMessage, toDiscussionMessage, toInstant } from '~/framework/modules/communities/adapter';
import DiscussionHeader, { DiscussionHeaderLoader } from '~/framework/modules/communities/components/discussions/header';
import { MessageEditorLauncher } from '~/framework/modules/communities/components/discussions/message-editor-launcher';
import DiscussionRepliesBar from '~/framework/modules/communities/components/discussions/replies-bar';
import UnreadMessagesSeparator from '~/framework/modules/communities/components/discussions/unread-messages-separator';
import { useCollapsibleDiscussionHeader } from '~/framework/modules/communities/hooks/use-collapsible-discussion-header';
import { useFirstUnreadMessage } from '~/framework/modules/communities/hooks/use-first-unread-message';
import { useScrollAndStickToTarget } from '~/framework/modules/communities/hooks/use-scroll-and-stick-to-target';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { deleteMessage, getDiscussion, getMessages, MESSAGES_PAGE_SIZE } from '~/framework/modules/communities/service/discussions';
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';
import { getDiscussionStatus } from '~/framework/modules/communities/utils';

import styles, { SCROLL_INDICATOR_INSETS } from './styles';
import { CommunitiesDiscussionDetailsScreen } from './types';

const FIRST_MESSAGE_LOADER_LINES = [100, 100, 100, 70];
const COMMENTS_LOADER_ROWS = Array.from({ length: DEFAULT_FLATLIST_PLACEHOLDER_ROWS }, (_, index) => index);
const MAINTAIN_VISIBLE_CONTENT_POSITION = { disabled: true };
const LATEST_REPLY_BUTTON_MIN_MESSAGES = 8;

export const DiscussionDetailsScreenOptions = screenOptions(() => ({ headerTitle: '' }));

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

const DiscussionDetailsLoader = React.memo(() => (
  <View style={styles.loaderRoot}>
    <DiscussionHeaderLoader />
    <View style={styles.loaderContent}>
      <Placeholder Animation={Fade}>
        <View style={styles.firstMessageLoader}>
          {FIRST_MESSAGE_LOADER_LINES.map((width, index) => (
            <PlaceholderLine key={index} noMargin style={styles.firstMessageLoaderLine} width={width} />
          ))}
        </View>
      </Placeholder>
      {COMMENTS_LOADER_ROWS.map(index => (
        <CommentsThreadItemLoader key={index} />
      ))}
    </View>
    <CommentsThreadAddFormLoader />
  </View>
));

export default withSession<CommunitiesDiscussionDetailsScreen.AllProps>(function DiscussionDetailsScreen({
  navigation,
  route: {
    params: { communityId, discussionId, lastMutation },
  },
  session,
}) {
  const dispatch = useDispatch();
  const discussion = useSelector(communitiesSelectors.getCommunityDiscussion(communityId, discussionId));
  const [messages, setMessages] = React.useState<PaginatedListItem<DiscussionMessage>[]>([]);
  const messagesRef = React.useRef(messages);
  messagesRef.current = messages;
  const scrollRef = React.useRef<FlashListRef<PaginatedListItem<DiscussionMessage>>>(null);
  const scrollOffset = useSharedValue(0);
  const onScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.value = event.nativeEvent.contentOffset.y;
    },
    [scrollOffset],
  );
  const { collapse, collapsedBandHeight, expandedBandHeight } = useCollapsibleDiscussionHeader(scrollOffset);
  const [isLayoutReady, setIsLayoutReady] = React.useState(false);
  const isHeaderMeasured = expandedBandHeight > 0;
  React.useEffect(() => {
    if (!isHeaderMeasured) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setIsLayoutReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [isHeaderMeasured]);

  const fetchDiscussion = React.useCallback(async () => {
    const loaded = await getDiscussion(session, communityId, discussionId);
    dispatch(communitiesActions.loadCommunityDiscussions(communityId, { [loaded.id]: loaded }));
  }, [communityId, discussionId, dispatch, session]);

  const isDiscussionFreshRef = React.useRef(false);
  // Fetch discussion if it's missing from the store
  const hasDiscussion = !!discussion;
  React.useEffect(() => {
    if (hasDiscussion) return;
    let cancelled = false;
    isDiscussionFreshRef.current = true;
    fetchDiscussion().catch(e => {
      if (cancelled) return;
      console.error('Error while loading community discussion', e);
      toast.showError();
      if (navigation.canGoBack()) navigation.goBack();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchDiscussion, hasDiscussion, navigation]);

  const firstUnread = useFirstUnreadMessage({
    communityId,
    discussion,
    discussionId,
    messagesCount: messages.length,
    session,
  });
  const firstUnreadIndex = firstUnread.status === 'unread' ? firstUnread.index : undefined;

  const onPageReached = React.useCallback<NonNullable<PaginatedFlashListProps<DiscussionMessage>['onPageReached']>>(
    async (page, reloadAll) => {
      if (reloadAll) {
        if (!isDiscussionFreshRef.current) await fetchDiscussion();
        isDiscussionFreshRef.current = false;
      }

      const { messages: loadedMessages, total } = await getMessages(session, communityId, discussionId, page, MESSAGES_PAGE_SIZE);
      const newData = loadedMessages.map(toDiscussionMessage);
      setMessages(previousData => mergeMessagesPage({ newData, previousData, reloadAll, start: page * MESSAGES_PAGE_SIZE, total }));
    },
    [communityId, discussionId, fetchDiscussion, session],
  );

  const loadLastPage = React.useCallback(
    async (expectedTotal: number) => {
      let page = Math.max(0, Math.floor((expectedTotal - 1) / MESSAGES_PAGE_SIZE));
      let result = await getMessages(session, communityId, discussionId, page, MESSAGES_PAGE_SIZE);
      const lastPage = Math.max(0, Math.floor((result.total - 1) / MESSAGES_PAGE_SIZE));
      if (lastPage !== page) {
        page = lastPage;
        result = await getMessages(session, communityId, discussionId, page, MESSAGES_PAGE_SIZE);
      }
      const newData = result.messages.map(toDiscussionMessage);
      setMessages(previousData =>
        mergeMessagesPage({ newData, previousData, start: page * MESSAGES_PAGE_SIZE, total: result.total }),
      );
    },
    [communityId, discussionId, session],
  );

  const onAddMessage = React.useCallback(() => {
    navigation.navigate(communitiesRouteNames.discussionMessageEditor, { communityId, discussionId });
  }, [communityId, discussionId, navigation]);

  // The editor loads the message again from its page: the list item index is also its index in the discussion
  const onEditMessage = React.useCallback(
    (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => {
      navigation.navigate(communitiesRouteNames.discussionMessageEditor, {
        communityId,
        discussionId,
        messageId: Number(item.id),
        page: Math.floor(index / MESSAGES_PAGE_SIZE),
      });
    },
    [communityId, discussionId, navigation],
  );

  const { onContentSizeChange, scrollAndStickTo, stopSticking } = useScrollAndStickToTarget({
    listRef: scrollRef,
    viewOffset: -collapsedBandHeight,
  });
  const stickToBottom = React.useCallback(() => scrollAndStickTo('end'), [scrollAndStickTo]);

  const goToLatestMessage = React.useCallback(
    (loading: Promise<unknown>) => {
      loading.then(stickToBottom).catch(e => {
        console.error('Error while reloading community discussion messages', e);
        toast.showError();
      });
    },
    [stickToBottom],
  );

  // No need to fetch again when the last page is already loaded: the unloaded pages are placeholders
  const onPressLatestReply = React.useCallback(() => {
    if (messagesRef.current.at(-1) !== LOADING_ITEM_DATA) stickToBottom();
    else goToLatestMessage(loadLastPage(messagesRef.current.length));
  }, [goToLatestMessage, loadLastPage, stickToBottom]);

  // Opens the discussion on its first unread message, or on the latest one when everything has already been read
  const hasInitiallyFocusedRef = React.useRef(false);
  const hasMessages = messages.length > 0;
  React.useEffect(() => {
    if (hasInitiallyFocusedRef.current || !isLayoutReady || !hasMessages || firstUnread.status === 'pending') return;
    hasInitiallyFocusedRef.current = true;
    if (firstUnread.status === 'all-read') onPressLatestReply();
    else if (firstUnread.status === 'unread') {
      const { index } = firstUnread;
      if (messagesRef.current[index] !== LOADING_ITEM_DATA) scrollAndStickTo(index);
      else
        onPageReached(Math.floor(index / MESSAGES_PAGE_SIZE))
          .then(() => scrollAndStickTo(index))
          .catch(e => {
            console.error('Error while loading community discussion messages', e);
            toast.showError();
          });
    }
  }, [firstUnread, hasMessages, isLayoutReady, onPageReached, onPressLatestReply, scrollAndStickTo]);

  // Reload the affected page when coming back from the message editor
  const handledMutationRef = React.useRef<number>(undefined);
  React.useEffect(() => {
    if (!lastMutation || handledMutationRef.current === lastMutation.at) return;
    handledMutationRef.current = lastMutation.at;
    const currentMessages = messagesRef.current;
    if (lastMutation.type === 'created') {
      // The discussion is fetched again for its updated messages count
      goToLatestMessage(Promise.all([fetchDiscussion(), loadLastPage(currentMessages.length + 1)]));
    } else {
      const index = currentMessages.findIndex(
        message => message !== LOADING_ITEM_DATA && message.id === lastMutation.messageId.toString(),
      );
      if (index === -1) return;
      onPageReached(Math.floor(index / MESSAGES_PAGE_SIZE)).catch(e => {
        console.error('Error while reloading community discussion messages', e);
        toast.showError();
      });
    }
  }, [fetchDiscussion, goToLatestMessage, lastMutation, loadLastPage, onPageReached]);

  const onDelete = React.useCallback(
    async (id: string) => {
      try {
        await deleteMessage(session, communityId, discussionId, Number(id));
        setMessages(previous =>
          previous.map(message => (message !== LOADING_ITEM_DATA && message.id === id ? toDeletedMessage(message) : message)),
        );
      } catch (e) {
        console.error('Error while deleting community discussion message', e);
        toast.showError();
      }
    },
    [communityId, discussionId, session],
  );

  const createdAt = React.useMemo(() => toInstant(discussion?.createdAt), [discussion?.createdAt]);

  const spacerStyle = React.useMemo(() => ({ height: expandedBandHeight }), [expandedBandHeight]);
  // Displays the spinner below the dicussion header
  const refreshControlProps = React.useMemo(
    () => ({ progressViewOffset: expandedBandHeight, tintColor: theme.palette.primary.regular }),
    [expandedBandHeight],
  );

  const listHeader = React.useMemo(
    () =>
      discussion ? (
        <>
          <View style={spacerStyle} />
          <BodyText style={styles.firstMessage}>{discussion.firstMessage}</BodyText>
          <DiscussionRepliesBar
            onPressLatestReply={discussion.nMessages >= LATEST_REPLY_BUTTON_MIN_MESSAGES ? onPressLatestReply : undefined}
            repliesCount={discussion.nMessages}
          />
        </>
      ) : null,
    [discussion, onPressLatestReply, spacerStyle],
  );

  const deletedPlaceholder = I18n.get('communities-discussion-message-deleted');

  const onPressDelete = React.useCallback(
    (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem) => {
      Alert.alert(I18n.get('comment-delete-alert-title'), I18n.get('comment-delete-alert-text'), [
        { onPress: () => {}, style: 'default', text: I18n.get('common-cancel') },
        { onPress: () => onDelete(item.id), style: 'destructive', text: I18n.get('common-delete') },
      ]);
    },
    [onDelete],
  );

  const keyExtractor = React.useCallback((item: DiscussionMessage) => item.id, []);

  // Distinct types so recycled cells are only reused between messages of the same kind (the unread separator changes the height)
  const getItemType = React.useCallback(
    (item: DiscussionMessage, index: number) => {
      if (index === firstUnreadIndex) return 'unread-separator';
      return item.type === CommentsThreadInternals.ITEM_COMMENT_DELETED ? 'deleted' : 'message';
    },
    [firstUnreadIndex],
  );

  // The separator replaces the top border of the first unread message
  const renderItem = React.useCallback<PaginatedFlashListProps<DiscussionMessage>['renderItem']>(
    info => {
      if (info.item.hidden) return null;
      const isFirstUnread = info.index === firstUnreadIndex;
      return (
        <>
          {isFirstUnread ? <UnreadMessagesSeparator /> : null}
          <CommentsThread.Item
            {...(info as unknown as ListRenderItemInfo<CommentsThreadInternals.Item>)}
            canAddComment
            deletedContentPlaceholder={deletedPlaceholder}
            hideTopBorder={isFirstUnread}
            onPressDelete={onPressDelete}
            onPressEdit={onEditMessage}
          />
        </>
      );
    },
    [deletedPlaceholder, firstUnreadIndex, onEditMessage, onPressDelete],
  );

  const renderPlaceholderItem = React.useCallback(() => <CommentsThreadItemLoader />, []);

  const showLoader = !isLayoutReady;

  return (
    <View style={styles.root}>
      {discussion ? (
        <>
          <PaginatedFlashList
            ref={scrollRef}
            data={messages}
            extraData={firstUnreadIndex}
            getItemType={getItemType}
            keyExtractor={keyExtractor}
            onPageReached={onPageReached}
            pageSize={MESSAGES_PAGE_SIZE}
            refreshControlProps={refreshControlProps}
            renderItem={renderItem}
            renderPlaceholderItem={renderPlaceholderItem}
            ListHeaderComponent={listHeader}
            onScroll={onScroll}
            onContentSizeChange={onContentSizeChange}
            // stops list position fix if user starts scrolling
            onScrollBeginDrag={stopSticking}
            scrollIndicatorInsets={SCROLL_INDICATOR_INSETS}
            contentInsetAdjustmentBehavior="never"
            maintainVisibleContentPosition={MAINTAIN_VISIBLE_CONTENT_POSITION}
          />
          <MessageEditorLauncher onPress={onAddMessage} placeholder={I18n.get('communities-discussion-message-add')} />
          <DiscussionHeader
            authorName={discussion.createdBy.displayName}
            authorProfile={discussion.createdBy.profile as AccountType}
            collapse={collapse}
            createdAt={createdAt}
            status={getDiscussionStatus(discussion)}
            title={discussion.title}
            type={discussion.icon}
          />
        </>
      ) : null}
      {showLoader ? <DiscussionDetailsLoader /> : null}
    </View>
  );
});
