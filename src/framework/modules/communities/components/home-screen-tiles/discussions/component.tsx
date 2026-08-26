import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import Pill from '~/framework/components/pill';
import { SmallBoldText } from '~/framework/components/text';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';

import styles from './styles';
import { DiscussionsTileProps } from './types';

const getDiscussionsCountText = (totalDiscussions: number): string => {
  const i18nKey = totalDiscussions === 1 ? 'communities-tile-discussions-discussion' : 'communities-tile-discussions-discussions';
  return I18n.get(i18nKey, { count: totalDiscussions });
};

const getPillText = (totalDiscussions: number, hasUnreadMessages?: boolean): string => {
  if (totalDiscussions === 0) return I18n.get('communities-tile-discussions-empty');
  if (hasUnreadMessages) return I18n.get('communities-tile-discussions-new');
  return getDiscussionsCountText(totalDiscussions);
};

const DiscussionsTile = ({
  communityId,
  hasUnreadMessages,
  navigation,
  totalDiscussions,
  userRole,
}: Readonly<DiscussionsTileProps>) => {
  const isEmpty = totalDiscussions === 0;
  const isUnavailable = isEmpty && userRole !== MembershipRole.ADMIN;
  const Wrapper = isUnavailable ? View : TouchableOpacity;
  const tileStyle = isUnavailable ? styles.tileDiscussionsUnavailable : styles.tileDiscussionsAvailable;
  const captionTextStyle = isUnavailable ? styles.tileCaptionTextUnavailable : styles.tileCaptionTextAvailable;
  const pillColor = isUnavailable ? theme.palette.grey.stone : theme.palette.grey.white;
  const pillTextColor = isUnavailable ? theme.palette.grey.white : theme.palette.primary.regular;

  const navigateToDiscussions = React.useCallback(
    () => navigation.navigate(communitiesRouteNames.discussions, { communityId }),
    [communityId, navigation],
  );

  const pillText = getPillText(totalDiscussions, hasUnreadMessages);

  return (
    <Wrapper style={tileStyle} onPress={navigateToDiscussions} testID="tile-discussions">
      <View style={styles.tileCaption}>
        <Svg
          name="ui-conversation"
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
          fill={captionTextStyle.color}
        />
        <SmallBoldText style={captionTextStyle}>{I18n.get('communities-tile-discussions-title')}</SmallBoldText>
      </View>
      <Pill
        bold={isEmpty && isUnavailable}
        color={pillColor}
        dot={!isEmpty && hasUnreadMessages ? theme.palette.status.failure.regular : undefined}
        italic={isEmpty && !isUnavailable}
        text={pillText}
        textColor={pillTextColor}
      />
    </Wrapper>
  );
};

export default DiscussionsTile;
