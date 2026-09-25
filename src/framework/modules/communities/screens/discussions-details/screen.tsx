import * as React from 'react';
import { View } from 'react-native';

import { MessageDto } from '@edifice.io/community-client-rest-rn';
import Animated, { useAnimatedRef, useScrollOffset } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { screenOptions } from '~/app/navigation/util';
import { LOADING_ITEM_DATA, PaginatedFlatListProps, staleOrSplice } from '~/framework/components/list/paginated-list';
import { LoadingIndicator } from '~/framework/components/loading';
import { BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { AccountType } from '~/framework/modules/auth/model';
import { withSession } from '~/framework/modules/auth/util';
import { PaginatedCommentsList, PaginatedCommentsListProps } from '~/framework/modules/comments/components/comments-list';
import { CommentsThreadInternals } from '~/framework/modules/comments/components/comments-thread-internal';
import { CommentDeletedItem, CommentItem } from '~/framework/modules/comments/types';
import { toInstant } from '~/framework/modules/communities/adapter';
import DiscussionHeader from '~/framework/modules/communities/components/discussions/header';
import { useCollapsibleDiscussionHeader } from '~/framework/modules/communities/hooks/use-collapsible-discussion-header';
import {
  createMessage,
  deleteMessage,
  getDiscussion,
  getMessages,
  updateMessage,
} from '~/framework/modules/communities/service/discussions';
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';
import { getDiscussionStatus } from '~/framework/modules/communities/utils';

import styles, { SCROLL_INDICATOR_INSETS } from './styles';
import { CommunitiesDiscussionDetailsScreen } from './types';

const PAGE_SIZE = 20;

const parseAccountTypesMap = {
  External: AccountType.External,
  Guest: AccountType.Guest,
  Personnel: AccountType.Personnel,
  Relative: AccountType.Relative,
  Student: AccountType.Student,
  Teacher: AccountType.Teacher,
} as const;

export const DiscussionDetailsScreenOptions = screenOptions(() => ({ headerShadowVisible: false, headerTitle: '' }));

function hydrateMessage(message: MessageDto): Omit<CommentItem, 'replies'> | Omit<CommentDeletedItem, 'replies'> {
  const common = {
    authorAccountType: parseAccountTypesMap[message.createdBy.profile],
    authorId: message.createdBy.entId,
    authorName: message.createdBy.displayName,
    date: toInstant(message.updatedAt ?? message.createdAt)!,
    id: message.id.toString(),
  };
  return message.deleted ? { ...common, deleted: true as const } : { ...common, content: message.htmlContent, isRichContent: true };
}

export default withSession<CommunitiesDiscussionDetailsScreen.AllProps>(function DiscussionDetailsScreen({
  route: {
    params: { communityId, discussionId },
  },
  session,
}) {
  const dispatch = useDispatch();
  const discussion = useSelector(communitiesSelectors.getCommunityDiscussion(communityId, discussionId));
  const [messages, setMessages] = React.useState<PaginatedCommentsListProps['data']>([]);
  // const [totalMessages, setTotalMessages] = React.useState<number>();
  // const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const scrollRef = useAnimatedRef<Animated.FlatList<CommentsThreadInternals.Item>>();
  const scrollOffset = useScrollOffset(scrollRef);
  const { collapse, expandedBandHeight } = useCollapsibleDiscussionHeader(scrollOffset);

  const onPageReached = React.useCallback<
    NonNullable<PaginatedFlatListProps<Omit<CommentItem, 'replies'> | Omit<CommentDeletedItem, 'replies'>>['onPageReached']>
  >(
    async (page, reloadAll) => {
      if (page === 0 || reloadAll) {
        const loaded = await getDiscussion(session, communityId, discussionId);
        dispatch(communitiesActions.loadCommunityDiscussions(communityId, { [loaded.id]: loaded }));
      }

      const { messages: loadedMessages, total } = await getMessages(session, communityId, discussionId, page, PAGE_SIZE);
      const newData = loadedMessages.map(hydrateMessage);
      setMessages(previousData => staleOrSplice({ newData, previousData, reloadAll, start: page * PAGE_SIZE, total }));
    },
    [communityId, discussionId, dispatch, session],
  );

  const onSubmit = React.useCallback<NonNullable<PaginatedCommentsListProps['onSubmit']>>(
    async data => {
      await createMessage(session, communityId, discussionId, data.content);
      await onPageReached(Math.floor((messages.length + 1) / PAGE_SIZE), true);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    },
    [communityId, discussionId, messages.length, onPageReached, scrollRef, session],
  );

  const onEdit = React.useCallback<NonNullable<PaginatedCommentsListProps['onEdit']>>(
    async (data, id) => {
      const updated = hydrateMessage(await updateMessage(session, communityId, discussionId, Number(id), data.content));
      setMessages(previous =>
        previous.map(message => (message !== LOADING_ITEM_DATA && message.id === updated.id ? updated : message)),
      );
    },
    [communityId, discussionId, session],
  );

  const onDelete = React.useCallback<NonNullable<PaginatedCommentsListProps['onDelete']>>(
    async id => {
      try {
        await deleteMessage(session, communityId, discussionId, Number(id));
        setMessages(previous =>
          previous.map(message => (message !== LOADING_ITEM_DATA && message.id === id ? { ...message, deleted: true } : message)),
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

  /** Keeps the refresh spinner from spinning behind the header overlay. */
  const refreshControlProps = React.useMemo(() => ({ progressViewOffset: expandedBandHeight }), [expandedBandHeight]);

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

  if (!discussion) return <LoadingIndicator />;

  return (
    <View style={styles.root}>
      <PaginatedCommentsList
        ref={scrollRef}
        data={messages}
        onPageReached={onPageReached}
        pageSize={PAGE_SIZE}
        ListHeaderComponent={listHeader}
        canAddComment={true}
        allowReplies={false}
        scrollIndicatorInsets={SCROLL_INDICATOR_INSETS}
        contentInsetAdjustmentBehavior="never"
        onEdit={onEdit}
        onDelete={onDelete}
        onSubmit={onSubmit}
      />
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
