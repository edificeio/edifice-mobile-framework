import * as React from 'react';
import { View } from 'react-native';

import { MessageDto } from '@edifice.io/community-client-rest-rn';
import Animated, { useAnimatedRef, useScrollOffset } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { screenOptions } from '~/app/navigation/util';
import { LoadingIndicator } from '~/framework/components/loading';
import { BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { AccountType } from '~/framework/modules/auth/model';
import { withSession } from '~/framework/modules/auth/util';
import { ResourceWithCommentsTemplate } from '~/framework/modules/comments';
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

import { CommentsThreadInternals, CommentsThreadProps } from '~/framework/modules/comments/components/comments-thread';

const PAGE_SIZE = 20;
const END_REACHED_THRESHOLD = 0.5;
const parseAccountTypesMap = {
  External: AccountType.External,
  Guest: AccountType.Guest,
  Personnel: AccountType.Personnel,
  Relative: AccountType.Relative,
  Student: AccountType.Student,
  Teacher: AccountType.Teacher,
} as const;

export const DiscussionDetailsScreenOptions = screenOptions(() => ({ headerShadowVisible: false, headerTitle: '' }));

export default withSession<CommunitiesDiscussionDetailsScreen.AllProps>(function DiscussionDetailsScreen({
  navigation,
  route: {
    params: { communityId, discussionId },
  },
  route,
  session,
}) {
  const dispatch = useDispatch();
  const discussion = useSelector(communitiesSelectors.getCommunityDiscussion(communityId, discussionId));
  const [messages, setMessages] = React.useState<MessageDto[]>([]);
  const [totalMessages, setTotalMessages] = React.useState<number>();
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const scrollRef = useAnimatedRef<Animated.FlatList<CommentsThreadInternals.Item>>();
  const scrollOffset = useScrollOffset(scrollRef);
  const { collapse, expandedBandHeight } = useCollapsibleDiscussionHeader(scrollOffset);

  const loadMessages = React.useCallback(
    async (size: number) => {
      const { messages: loadedMessages, total } = await getMessages(session, communityId, discussionId, 0, size);
      setTotalMessages(total);
      setMessages(loadedMessages);
    },
    [communityId, discussionId, session],
  );

  const loadContent = React.useCallback<ContentLoaderProps['loadContent']>(async () => {
    const [loaded] = await Promise.all([getDiscussion(session, communityId, discussionId), loadMessages(PAGE_SIZE)]);
    dispatch(communitiesActions.loadCommunityDiscussions(communityId, { [loaded.id]: loaded }));
  }, [communityId, discussionId, dispatch, loadMessages, session]);

  const loadNextPage = React.useCallback(async () => {
    if (isLoadingMore || messages.length >= (totalMessages ?? 0)) return;
    setIsLoadingMore(true);
    try {
      const { messages: loadedMessages, total } = await getMessages(
        session,
        communityId,
        discussionId,
        Math.floor(messages.length / PAGE_SIZE),
        PAGE_SIZE,
      );
      setTotalMessages(total);
      setMessages(previous => [...previous, ...loadedMessages]);
    } catch (e) {
      console.error('Error while loading community discussion messages', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [communityId, discussionId, isLoadingMore, messages.length, session, totalMessages]);

  const onSubmit = React.useCallback<NonNullable<CommentsThreadProps['onSubmit']>>(
    async data => {
      const created = await createMessage(session, communityId, discussionId, data.content);
      await loadMessages((totalMessages ?? 0) + 1);
      return created.id.toString();
    },
    [communityId, discussionId, loadMessages, session, totalMessages],
  );

  const onEdit = React.useCallback<NonNullable<CommentsThreadProps['onEdit']>>(
    async (data, id) => {
      const updated = await updateMessage(session, communityId, discussionId, Number(id), data.content);
      setMessages(previous => previous.map(message => (message.id === updated.id ? updated : message)));
    },
    [communityId, discussionId, session],
  );

  const onDelete = React.useCallback<NonNullable<CommentsThreadProps['onDelete']>>(
    async id => {
      const messageId = Number(id);
      try {
        await deleteMessage(session, communityId, discussionId, messageId);
        setMessages(previous => previous.map(message => (message.id === messageId ? { ...message, deleted: true } : message)));
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

  const data = React.useMemo<CommentsThreadProps['data']>(
    () =>
      messages.map(message => {
        const common = {
          authorAccountType: parseAccountTypesMap[message.createdBy.profile],
          authorId: message.createdBy.entId,
          authorName: message.createdBy.displayName,
          date: toInstant(message.updatedAt ?? message.createdAt)!,
          id: message.id.toString(),
          replies: [],
        };
        return message.deleted
          ? { ...common, deleted: true as const }
          : { ...common, content: message.htmlContent, isRichContent: true };
      }),
    [messages],
  );

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

  const listFooter = React.useMemo(
    () => (isLoadingMore && messages.length ? <LoadingIndicator small customStyle={styles.listFooterLoader} /> : null),
    [isLoadingMore, messages.length],
  );

  const renderContent = React.useCallback<ContentLoaderProps['renderContent']>(
    refreshControl => {
      if (!discussion) return <LoadingIndicator />;
      return (
        <View style={styles.root}>
          <ResourceWithCommentsTemplate
            canAddComment={true}
            route={route}
            navigation={navigation}
            refreshControl={refreshControl}
            data={data}
            allowReplies={false}
            scrollIndicatorInsets={SCROLL_INDICATOR_INSETS}
            contentInsetAdjustmentBehavior="never"
            onEndReached={loadNextPage}
            onEndReachedThreshold={END_REACHED_THRESHOLD}
            onEdit={onEdit}
            onDelete={onDelete}
            onSubmit={onSubmit}
            ListHeaderComponent={listHeader}
            ListFooterComponent={listFooter}
            ref={scrollRef}
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
    },
    [
      collapse,
      createdAt,
      data,
      discussion,
      listFooter,
      listHeader,
      navigation,
      onDelete,
      onEdit,
      loadNextPage,
      onSubmit,
      route,
      scrollRef,
    ],
  );

  return <ContentLoader loadContent={loadContent} renderContent={renderContent} refreshControlProps={refreshControlProps} />;
});
