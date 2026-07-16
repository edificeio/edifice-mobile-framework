import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import Pill from '~/framework/components/pill';
import { SmallBoldText } from '~/framework/components/text';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { openUrl } from '~/framework/util/linking';

import styles from './styles';
import { ConversationTileProps } from './types';

const ConversationTile = ({
  communityId,
  hasDiscussions,
  hasUnreadMessages,
  navigation,
  platformUrl,
  totalDiscussions,
}: Readonly<ConversationTileProps>) => {
  const redirectToWeb = React.useCallback(() => {
    openUrl(`${platformUrl}/communities/id/${communityId}/discussions`);
  }, [communityId, platformUrl]);

  const Wrapper = hasDiscussions ? TouchableOpacity : View;
  const tileStyle = hasDiscussions ? styles.tileConversationAvailable : styles.tileConversationUnavailable;

  const navigateToDiscussions = React.useCallback(
    () => navigation.navigate(communitiesRouteNames.conversation, { communityId }),
    [communityId, navigation],
  );

  const isEmpty = totalDiscussions === 0;
  const pillText = isEmpty
    ? I18n.get('communities-tile-conversations-empty')
    : hasUnreadMessages
      ? I18n.get('communities-tile-conversations-new')
      : I18n.get(
          totalDiscussions === 1 ? 'communities-tile-conversations-discussion' : 'communities-tile-conversations-discussions',
          { count: totalDiscussions },
        );

  return (
    <Wrapper style={tileStyle} onPress={redirectToWeb} testID="tile-conversations">
      <View style={styles.tileCaption}>
        <Svg
          name="ui-conversation"
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
          fill={styles.tileCaptionTextAvailable.color}
        />
        <SmallBoldText style={styles.tileCaptionTextAvailable}>{I18n.get('communities-tile-conversations-title')}</SmallBoldText>
      </View>
      <Pill
        color={theme.palette.grey.white}
        dot={!isEmpty && hasUnreadMessages ? theme.palette.status.failure.regular : undefined}
        italic={isEmpty}
        text={pillText}
        textColor={theme.palette.primary.regular}
      />
    </Wrapper>
  );
};

export default ConversationTile;
