import * as React from 'react';
import { Alert, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';

import { useSharedValue } from 'react-native-reanimated';
import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { hasMediaContent } from '~/framework/components/inputs/rich-text/native-viewer';
import {
  DEFAULT_FLATLIST_PLACEHOLDER_ROWS,
  PaginatedFlashList,
  PaginatedFlashListProps,
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
import { DiscussionMessage, toInstant } from '~/framework/modules/communities/adapter';
import DiscussionHeader, { DiscussionHeaderLoader } from '~/framework/modules/communities/components/discussions/header';
import { MessageEditorLauncher } from '~/framework/modules/communities/components/discussions/message-editor-launcher';
import DiscussionRepliesBar from '~/framework/modules/communities/components/discussions/replies-bar';
import UnreadMessagesSeparator from '~/framework/modules/communities/components/discussions/unread-messages-separator';
import { useCollapsibleDiscussionHeader } from '~/framework/modules/communities/hooks/use-collapsible-discussion-header';
import { useDiscussion } from '~/framework/modules/communities/hooks/use-discussion';
import { useDiscussionMessages } from '~/framework/modules/communities/hooks/use-discussion-messages';
import { useDiscussionScroll } from '~/framework/modules/communities/hooks/use-discussion-scroll';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { deleteMessage, MESSAGES_PAGE_SIZE } from '~/framework/modules/communities/service/discussions';
import { getDiscussionStatus } from '~/framework/modules/communities/utils';

import styles, { SCROLL_INDICATOR_INSETS } from './styles';
import { CommunitiesDiscussionDetailsScreen } from './types';

const FIRST_MESSAGE_LOADER_LINES = [100, 100, 100, 70];
const COMMENTS_LOADER_ROWS = Array.from({ length: DEFAULT_FLATLIST_PLACEHOLDER_ROWS }, (_, index) => index);
const LATEST_REPLY_BUTTON_MIN_MESSAGES = 8;

export const DiscussionDetailsScreenOptions = screenOptions(() => ({ headerTitle: '' }));

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
  const [isLayoutReady, setIsLayoutReady] = React.useState(false);
  const scrollOffset = useSharedValue(0);
  const { collapse, collapsedBandHeight, expandedBandHeight } = useCollapsibleDiscussionHeader(scrollOffset);

  const onDiscussionLoadError = React.useCallback(
    (e: unknown) => {
      console.error('Error while loading community discussion', e);
      toast.showError();
      if (navigation.canGoBack()) navigation.goBack();
    },
    [navigation],
  );

  const { discussion, fetchDiscussion, refreshDiscussion } = useDiscussion({
    communityId,
    discussionId,
    onLoadError: onDiscussionLoadError,
    session,
  });

  const {
    consumeInitialTarget,
    firstUnreadIndex,
    initialScrollIndex,
    isLastPageLoaded,
    loadLastPage,
    markMessageAsDeleted,
    messages,
    onPageReached,
    reloadMessagePage,
  } = useDiscussionMessages({ communityId, discussion, discussionId, refreshDiscussion, session });

  const { goToLatestMessage, initialScrollIndexParams, onCommitLayoutEffect, onLoad, onPressLatestReply, scrollRef } =
    useDiscussionScroll({ collapsedBandHeight, consumeInitialTarget, isLastPageLoaded, loadLastPage, messages });

  const handledMutationRef = React.useRef<number>(undefined);

  const isHeaderMeasured = expandedBandHeight > 0;
  const showLoader = !isLayoutReady;
  const deletedPlaceholder = I18n.get('communities-discussion-message-deleted');
  const createdAt = React.useMemo(() => toInstant(discussion?.createdAt), [discussion?.createdAt]);
  const spacerStyle = React.useMemo(() => ({ height: expandedBandHeight }), [expandedBandHeight]);
  // Displays the spinner below the dicussion header
  const refreshControlProps = React.useMemo(
    () => ({ progressViewOffset: expandedBandHeight, tintColor: theme.palette.primary.regular }),
    [expandedBandHeight],
  );

  const onScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.value = event.nativeEvent.contentOffset.y;
    },
    [scrollOffset],
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

  const onDelete = React.useCallback(
    async (id: string) => {
      try {
        await deleteMessage(session, communityId, discussionId, Number(id));
        markMessageAsDeleted(id);
      } catch (e) {
        console.error('Error while deleting community discussion message', e);
        toast.showError();
      }
    },
    [communityId, discussionId, markMessageAsDeleted, session],
  );

  const onPressDelete = React.useCallback(
    (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem) => {
      Alert.alert(I18n.get('comment-delete-alert-title'), I18n.get('comment-delete-alert-text'), [
        { onPress: () => {}, style: 'default', text: I18n.get('common-cancel') },
        { onPress: () => onDelete(item.id), style: 'destructive', text: I18n.get('common-delete') },
      ]);
    },
    [onDelete],
  );

  React.useEffect(() => {
    if (!isHeaderMeasured) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setIsLayoutReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [isHeaderMeasured]);

  // Reload the affected page when coming back from the message editor
  React.useEffect(() => {
    if (!lastMutation || handledMutationRef.current === lastMutation.at) return;
    handledMutationRef.current = lastMutation.at;
    if (lastMutation.type === 'created') {
      // The discussion is fetched again for its updated messages count
      goToLatestMessage(Promise.all([fetchDiscussion(), loadLastPage()]));
    } else {
      reloadMessagePage(lastMutation.messageId).catch(e => {
        console.error('Error while reloading community discussion messages', e);
        toast.showError();
      });
    }
  }, [fetchDiscussion, goToLatestMessage, lastMutation, loadLastPage, reloadMessagePage]);

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

  const keyExtractor = React.useCallback((item: DiscussionMessage) => item.id, []);

  // Distinct types so recycled cells are only reused between messages of the same kind (the unread separator changes the height).
  // FlashList also estimates the height of the messages not measured yet from the latest measured ones of the same type:
  // mixing text and media messages would make these estimates very wrong, and the list jumps when the user scrolls up.
  const getItemType = React.useCallback(
    (item: DiscussionMessage, index: number) => {
      if (index === firstUnreadIndex) return 'unread-separator';
      if (item.type === CommentsThreadInternals.ITEM_COMMENT_DELETED) return 'deleted';
      return hasMediaContent(item.content) ? 'media-message' : 'message';
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

  return (
    <View style={styles.root}>
      {discussion ? (
        <>
          <PaginatedFlashList
            ref={scrollRef}
            data={messages}
            extraData={firstUnreadIndex}
            getItemType={getItemType}
            initialScrollIndex={initialScrollIndex}
            initialScrollIndexParams={initialScrollIndexParams}
            keyExtractor={keyExtractor}
            ListHeaderComponent={listHeader}
            onCommitLayoutEffect={onCommitLayoutEffect}
            onLoad={onLoad}
            onPageReached={onPageReached}
            onScroll={onScroll}
            pageSize={MESSAGES_PAGE_SIZE}
            refreshControlProps={refreshControlProps}
            renderItem={renderItem}
            renderPlaceholderItem={renderPlaceholderItem}
            scrollIndicatorInsets={SCROLL_INDICATOR_INSETS}
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
