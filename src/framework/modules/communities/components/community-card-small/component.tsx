import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { InvitationStatus } from '@edifice.io/community-client-rest-rn';

import { getCardStyle, styles } from './styles';
import { CommunityCardSmallProps } from './types';

import { BodyBoldText } from '~/framework/components/text';
import { COMMUNITY_DEFAULT_THUMBNAIL_IMAGE_SIZE } from '~/framework/modules/communities/adapter';
import CommunityInvitationBadge from '~/framework/modules/communities/components/community-invitation-badge';
import CommunityMembersPill from '~/framework/modules/communities/components/community-members-pill/';
import { useAppTheme } from '~/framework/modules/myapps/hooks';
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
  const appTheme = useAppTheme('communities');
  const imageSource = React.useMemo(
    () => (image ? sessionImageSource(injectImageSource(image, COMMUNITY_DEFAULT_THUMBNAIL_IMAGE_SIZE)) : undefined),
    [image],
  );

  const cardStyle = React.useMemo(
    () => [getCardStyle(invitationStatus), itemSeparatorStyle],
    [invitationStatus, itemSeparatorStyle],
  );

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress} testID="community-card-small">
      <Image
        fallback={{ icon: appTheme.icon, accentColors: appTheme.colors } as any}
        source={imageSource}
        style={styles.imgContainer}
      />
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
