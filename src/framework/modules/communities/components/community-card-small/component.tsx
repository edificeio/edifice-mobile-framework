import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { InvitationStatus } from '@edifice.io/community-client-rest-rn';
import { useSelector } from 'react-redux';

import theme from '~/app/theme';
import { SvgIconName } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';
import { COMMUNITY_DEFAULT_THUMBNAIL_IMAGE_SIZE } from '~/framework/modules/communities/adapter';
import CommunityInvitationBadge from '~/framework/modules/communities/components/community-invitation-badge';
import CommunityMembersPill from '~/framework/modules/communities/components/community-members-pill/';
import { injectImageSource } from '~/framework/modules/media';
import { Image } from '~/framework/modules/media/components/image';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { sessionImageSource } from '~/framework/util/transport';

import { getCardStyle, styles } from './styles';
import { CommunityCardSmallProps } from './types';

export const CommunityCardSmall = ({
  image,
  invitationStatus,
  itemSeparatorStyle,
  membersCount,
  onPress,
  title,
}: Readonly<CommunityCardSmallProps>) => {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const appTheme = aggregatedApps.Communities;
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
        fallback={{
          accentColors:
            appTheme.color && appTheme.color !== 'nabook-color'
              ? theme.palette.complementary[appTheme.color]
              : theme.palette.primary,
          icon: { name: appTheme.icon as SvgIconName, type: 'Svg' },
        }}
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
