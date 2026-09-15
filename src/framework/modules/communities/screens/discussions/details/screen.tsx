import * as React from 'react';
import { View } from 'react-native';

import { MessageDto } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';
import Animated, { useAnimatedRef, useScrollOffset } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { LoadingIndicator } from '~/framework/components/loading';
import { BodyText, SmallBoldText } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';
import { withSession } from '~/framework/modules/auth/util';
import { ResourceWithComments } from '~/framework/modules/comments';
import CommentsThreadTemplate, { CommentsThreadProps } from '~/framework/modules/comments/components/comments-thread';
import { toInstant } from '~/framework/modules/communities/adapter';
import DiscussionHeader from '~/framework/modules/communities/components/discussions/header';
import { useCollapsibleDiscussionHeader } from '~/framework/modules/communities/hooks/use-collapsible-discussion-header';
import { getDiscussion, getMessages } from '~/framework/modules/communities/service/discussions';
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
  const [hasFailed, setHasFailed] = React.useState(false);
  const [messages, setMessages] = React.useState<MessageDto[]>([]);
  /**
   * @todo
   * When merging with the comments list : drop scrollRef and scrollOffset to use the one's from Valentin's list
   * For messages fetch : see if we use my getMessages in the service, delete it if we don't,
   * and clean messages fetching logic that is commented in this file
   * Also remove the LoadingIndicator and hasFailed state
   */
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const { collapse, expandedBandHeight } = useCollapsibleDiscussionHeader(scrollOffset);

  React.useEffect(() => {
    if (discussion) return;
    (async () => {
      try {
        const loaded = await getDiscussion(session, communityId, discussionId);
        dispatch(communitiesActions.loadCommunityDiscussions(communityId, { [loaded.id]: loaded }));
      } catch (e) {
        console.error('Error while loading community discussion', e);
        setHasFailed(true);
      }
    })();
  }, [communityId, discussion, discussionId, dispatch, session]);

  React.useEffect(() => {
    (async () => {
      try {
        const { messages: loadedMessages } = await getMessages(session, communityId, discussionId, 0, PAGE_SIZE);
        setMessages(loadedMessages);
      } catch (e) {
        console.error('Error while loading community discussion messages', e);
      }
    })();
  }, [communityId, discussionId, session]);

  const createdAt = React.useMemo(() => toInstant(discussion?.createdAt), [discussion?.createdAt]);

  const contentContainerStyle = React.useMemo(() => ({ paddingTop: expandedBandHeight }), [expandedBandHeight]);

  const data = React.useMemo<CommentsThreadProps['data']>(
    () =>
      messages.map(message => {
        const ret = {
          authorAccountType: parseAccountTypesMap[message.createdBy.profile],
          authorId: message.createdBy.entId,
          authorName: message.createdBy.displayName,
          content: message.htmlContent,
          date: toInstant(message.updatedAt ?? message.createdAt)!,
          id: message.id.toString(),
          isRichContent: true,
          replies: [],
        };
        if (message.deleted) {
          ret.deleted = true;
        }
        return ret;
      }),
    [messages],
  );

  console.info('data', data);

  if (!discussion)
    return (
      <View style={styles.placeholderContainer}>
        {hasFailed ? <SmallBoldText>{I18n.get('error-error-content-text')}</SmallBoldText> : <LoadingIndicator />}
      </View>
    );

  return (
    <View style={styles.root}>
      <ResourceWithComments
        canAddComment
        route={route}
        navigation={navigation}
        resourceId={discussionId}
        data={data}
        allowReplies={false}>
        <BodyText style={styles.firstMessage}>{discussion.firstMessage}</BodyText>
        <DiscussionHeader
          authorName={discussion.createdBy.displayName}
          authorProfile={discussion.createdBy.profile as AccountType}
          collapse={collapse}
          createdAt={createdAt}
          status={getDiscussionStatus(discussion)}
          title={discussion.title}
          type={discussion.icon}
        />
      </ResourceWithComments>
    </View>
  );
});

{
  /*<View style={styles.root}>
  <Animated.ScrollView
    contentContainerStyle={contentContainerStyle}
    contentInsetAdjustmentBehavior="never"
    ref={scrollRef}
    scrollIndicatorInsets={SCROLL_INDICATOR_INSETS}
    style={styles.scroll}>
    <BodyText style={styles.firstMessage}>{discussion.firstMessage}</BodyText>
  </Animated.ScrollView>
  <DiscussionHeader
    authorName={discussion.createdBy.displayName}
    authorProfile={discussion.createdBy.profile as AccountType}
    collapse={collapse}
    createdAt={createdAt}
    status={getDiscussionStatus(discussion)}
    title={discussion.title}
    type={discussion.icon}
  />
</View>*/
}
