import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { InvitationStatus } from '@edifice.io/community-client-rest-rn';

import { getCardStyle, styles } from './styles';
import { CommunityCardSmallProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyBoldText } from '~/framework/components/text';
import CommunityInvitationBadge from '~/framework/modules/communities/components/community-invitation-badge';
import CommunityMembersPill from '~/framework/modules/communities/components/community-members-pill/';
import { injectImageSource } from '~/framework/util/media';
import { Image } from '~/framework/util/media/components/image';
import { sessionImageSource } from '~/framework/util/transport';

export const CommunityCardSmall = ({
  image,
  invitationStatus,
  itemSeparatorStyle,
  membersCount,
  onPress,
  title,
}: Readonly<CommunityCardSmallProps>) => {
  const imageApproximateDimensions = React.useMemo(
    () => ({
      height: 130,
      width: 440,
    }),
    [],
  );

  const imageSource = React.useMemo(
    () => (image ? sessionImageSource(injectImageSource(image, imageApproximateDimensions)) : undefined),
    [image, imageApproximateDimensions],
  );

  const cardStyle = React.useMemo(
    () => [getCardStyle(invitationStatus), itemSeparatorStyle],
    [invitationStatus, itemSeparatorStyle],
  );

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress} testID="community-card-small">
      <Image fallback={theme.apps.communities} source={imageSource} style={styles.imgContainer} />
      {membersCount && <CommunityMembersPill membersCount={membersCount} />}
      {invitationStatus === InvitationStatus.PENDING && <CommunityInvitationBadge />}
      <View style={styles.titleContainer}>
        <BodyBoldText numberOfLines={1} ellipsizeMode="tail">
          {title}
        </BodyBoldText>
      </View>
    </TouchableOpacity>
  );
};
