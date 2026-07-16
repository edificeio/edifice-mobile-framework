import * as React from 'react';
import { ScrollView } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { SmallBoldText } from '~/framework/components/text';
import { withSession } from '~/framework/modules/auth/util';
import ConversationCard from '~/framework/modules/communities/components/conversation-card';
import { Discussion, getDiscussions } from '~/framework/modules/communities/service/conversations';

import styles from './styles';
import { CommunitiesConversationScreen } from './types';

export const ConversationScreenOptions = screenOptions(() => ({
  title: I18n.get('communities-tile-conversations-title'),
}));

const onPress = () => {};

export default withSession<CommunitiesConversationScreen.AllProps>(function ConversationScreen({
  route: {
    params: { communityId },
  },
  session,
}) {
  const [data, setData] = React.useState<Discussion[]>();

  const loadData = React.useCallback(async () => {
    setData(await getDiscussions(session, communityId));
  }, [communityId, session]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  if (data?.length === 0) return <SmallBoldText>Empty screen à mettre ici</SmallBoldText>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data?.map(discussion => (
        <ConversationCard
          key={discussion.id}
          isHidden={!!discussion.hiddenAt}
          isLocked={!!discussion.lockedAt}
          lastMessageDate={Temporal.Instant.from(new Date(discussion.lastMessageTime).toISOString())}
          membersDisplayed={(discussion.firstUsers ?? []).map(user => user.entId)}
          membersTotal={discussion.nUsers}
          newContent={{ hasNewContent: discussion.hasUnreadMessages, messagesCount: discussion.unreadCount }}
          responsesCount={discussion.nMessages}
          title={discussion.title}
          type={discussion.icon}
          onPress={onPress}
        />
      ))}
    </ScrollView>
  );
});
