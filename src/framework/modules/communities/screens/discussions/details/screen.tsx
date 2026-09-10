import * as React from 'react';
import { View } from 'react-native';

import { MessageDto } from '@edifice.io/community-client-rest-rn';
import { useDispatch, useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { LoadingIndicator } from '~/framework/components/loading';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { withSession } from '~/framework/modules/auth/util';
import { getDiscussion, getMessages } from '~/framework/modules/communities/service/discussions';
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';

import styles from './styles';
import { CommunitiesDiscussionDetailsScreen } from './types';

const PAGE_SIZE = 20;

export const DiscussionDetailsScreenOptions = screenOptions(() => ({ headerShadowVisible: false, headerTitle: '' }));

export default withSession<CommunitiesDiscussionDetailsScreen.AllProps>(function DiscussionDetailsScreen({
  route: {
    params: { communityId, discussionId },
  },
  session,
}) {
  const dispatch = useDispatch();
  const discussion = useSelector(communitiesSelectors.getCommunityDiscussion(communityId, discussionId));
  const [hasFailed, setHasFailed] = React.useState(false);
  const [messages, setMessages] = React.useState<MessageDto[]>([]);

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

  if (!discussion)
    return (
      <View style={styles.container}>
        {hasFailed ? <SmallBoldText>{I18n.get('error-error-content-text')}</SmallBoldText> : <LoadingIndicator />}
      </View>
    );

  return (
    <View style={styles.container}>
      <SmallBoldText>{discussion.title}</SmallBoldText>
      {messages.map(message => (
        <React.Fragment key={message.id}>
          <SmallText>{message.createdBy.displayName}</SmallText>
          <SmallText>{message.htmlContent}</SmallText>
        </React.Fragment>
      ))}
    </View>
  );
});
