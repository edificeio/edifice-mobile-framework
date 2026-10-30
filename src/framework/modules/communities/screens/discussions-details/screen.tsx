import * as React from 'react';
import { Alert, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';

import { MessageDto } from '@edifice.io/community-client-rest-rn';
import { FlashListRef } from '@shopify/flash-list';
import { useSharedValue } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import {
  LOADING_ITEM_DATA,
  PaginatedFlashList,
  PaginatedFlashListProps,
  PaginatedListItem,
  staleOrSplice,
} from '~/framework/components/list/paginated-list';
import { LoadingIndicator } from '~/framework/components/loading';
import { BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { AccountType } from '~/framework/modules/auth/model';
import { withSession } from '~/framework/modules/auth/util';
import { CommentsThreadInternals } from '~/framework/modules/comments/components/comments-thread-internal';
import { CommentsThread } from '~/framework/modules/comments/components/comments-thread-internal/item';
import { toInstant } from '~/framework/modules/communities/adapter';
import DiscussionHeader from '~/framework/modules/communities/components/discussions/header';
import { MessageEditorLauncher } from '~/framework/modules/communities/components/discussions/message-editor-launcher';
import { useCollapsibleDiscussionHeader } from '~/framework/modules/communities/hooks/use-collapsible-discussion-header';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { deleteMessage, getDiscussion, getMessages, MESSAGES_PAGE_SIZE } from '~/framework/modules/communities/service/discussions';
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';
import { getDiscussionStatus } from '~/framework/modules/communities/utils';

import styles, { SCROLL_INDICATOR_INSETS } from './styles';
import { CommunitiesDiscussionDetailsScreen } from './types';

const parseAccountTypesMap = {
  External: AccountType.External,
  Guest: AccountType.Guest,
  Personnel: AccountType.Personnel,
  Relative: AccountType.Relative,
  Student: AccountType.Student,
  Teacher: AccountType.Teacher,
} as const;

export const DiscussionDetailsScreenOptions = screenOptions(() => ({ headerTitle: '' }));

type DiscussionMessage = (CommentsThreadInternals.CommentItem | CommentsThreadInternals.CommentDeletedItem) & { hidden?: boolean };

const toDeletedMessage = ({
  authorAccountType,
  authorId,
  authorName,
  date,
  hidden,
  id,
  nbReplies,
}: DiscussionMessage): DiscussionMessage => ({
  authorAccountType,
  authorId,
  authorName,
  date,
  deleted: true,
  hidden,
  id,
  nbReplies,
  type: CommentsThreadInternals.ITEM_COMMENT_DELETED,
});

function hydrateMessage(message: MessageDto): DiscussionMessage {
  const common = {
    authorAccountType: parseAccountTypesMap[message.createdBy.profile],
    authorId: message.createdBy.entId,
    authorName: message.createdBy.displayName,
    date: toInstant(message.updatedAt ?? message.createdAt)!,
    hidden: message.isFirstMessage,
    id: message.id.toString(),
    nbReplies: 0,
  };
  return message.deleted
    ? { ...common, deleted: true as const, type: CommentsThreadInternals.ITEM_COMMENT_DELETED }
    : { ...common, content: message.htmlContent, isRichContent: true, type: CommentsThreadInternals.ITEM_COMMENT };
}

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
  const scrollRef = React.useRef<FlashListRef<PaginatedListItem<DiscussionMessage>>>(null);
  const scrollOffset = useSharedValue(0);
  const onScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.value = event.nativeEvent.contentOffset.y;
    },
    [scrollOffset],
  );
  const { collapse, expandedBandHeight } = useCollapsibleDiscussionHeader(scrollOffset);

  const fetchDiscussion = React.useCallback(async () => {
    const loaded = await getDiscussion(session, communityId, discussionId);
    dispatch(communitiesActions.loadCommunityDiscussions(communityId, { [loaded.id]: loaded }));
  }, [communityId, discussionId, dispatch, session]);

  // Fetch discussion if it's missing from the store
  const hasDiscussion = !!discussion;
  React.useEffect(() => {
    if (hasDiscussion) return;
    let cancelled = false;
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

  const onPageReached = React.useCallback<NonNullable<PaginatedFlashListProps<DiscussionMessage>['onPageReached']>>(
    async (page, reloadAll) => {
      if (page === 0 || reloadAll) await fetchDiscussion();

      const { messages: loadedMessages, total } = await getMessages(session, communityId, discussionId, page, MESSAGES_PAGE_SIZE);
      const newData = loadedMessages.map(hydrateMessage);
      setMessages(previousData => staleOrSplice({ newData, previousData, reloadAll, start: page * MESSAGES_PAGE_SIZE, total }));
    },
    [communityId, discussionId, fetchDiscussion, session],
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

  // Reload the affected page when coming back from the message editor
  const messagesRef = React.useRef(messages);
  messagesRef.current = messages;
  const handledMutationRef = React.useRef<number>(undefined);
  React.useEffect(() => {
    if (!lastMutation || handledMutationRef.current === lastMutation.at) return;
    handledMutationRef.current = lastMutation.at;
    const currentMessages = messagesRef.current;
    if (lastMutation.type === 'created') {
      onPageReached(Math.floor(currentMessages.length / MESSAGES_PAGE_SIZE), true)
        .then(() => {
          requestAnimationFrame(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          });
        })
        .catch(e => {
          console.error('Error while reloading community discussion messages', e);
          toast.showError();
        });
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
  }, [lastMutation, onPageReached, scrollRef]);

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

  const listHeader = React.useMemo(
    () =>
      discussion ? (
        <>
          <View style={spacerStyle} />
          <BodyText style={styles.firstMessage}>{discussion.firstMessage}</BodyText>
        </>
      ) : null,
    [discussion, spacerStyle],
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

  // Distinct types so recycled cells are only reused between messages of the same kind
  const getItemType = React.useCallback(
    (item: DiscussionMessage) => (item.type === CommentsThreadInternals.ITEM_COMMENT_DELETED ? 'deleted' : 'message'),
    [],
  );

  const renderItem = React.useCallback<PaginatedFlashListProps<DiscussionMessage>['renderItem']>(
    info =>
      info.item.hidden ? null : (
        <CommentsThread.Item
          {...(info as unknown as ListRenderItemInfo<CommentsThreadInternals.Item>)}
          canAddComment
          deletedContentPlaceholder={deletedPlaceholder}
          onPressDelete={onPressDelete}
          onPressEdit={onEditMessage}
        />
      ),
    [deletedPlaceholder, onEditMessage, onPressDelete],
  );

  const renderPlaceholderItem = React.useCallback(() => <View style={styles.placeholderItem} />, []);

  if (!discussion) return <LoadingIndicator />;

  return (
    <View style={styles.root}>
      <PaginatedFlashList
        ref={scrollRef}
        data={messages}
        getItemType={getItemType}
        keyExtractor={keyExtractor}
        onPageReached={onPageReached}
        pageSize={MESSAGES_PAGE_SIZE}
        renderItem={renderItem}
        renderPlaceholderItem={renderPlaceholderItem}
        ListHeaderComponent={listHeader}
        onScroll={onScroll}
        scrollIndicatorInsets={SCROLL_INDICATOR_INSETS}
        contentInsetAdjustmentBehavior="never"
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
    </View>
  );
});
