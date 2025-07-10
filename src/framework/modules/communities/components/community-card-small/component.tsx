import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { InvitationStatus } from '@edifice.io/community-client-rest-rn';

import { getCardStyle, styles } from './styles';
import { CommunityCardSmallProps } from './types';

import ModuleImage from '~/framework/components/picture/module-image';
import { BodyBoldText } from '~/framework/components/text';
import CommunityInvitationBadge from '~/framework/modules/communities/components/community-invitation-badge';
import CommunityMembersPill from '~/framework/modules/communities/components/community-members-pill/';
import moduleConfig from '~/framework/modules/communities/module-config';
import http from '~/framework/util/http';

export const CommunityCardSmall = ({
  image,
  invitationStatus,
  itemSeparatorStyle,
  membersCount,
  onPress,
  title,
}: Readonly<CommunityCardSmallProps>) => {
  const imageProps = React.useMemo(() => {
    return image ? http.imagePropsForSession({ source: { uri: image } }) : undefined;
  }, [image]);

  const cardStyle = React.useMemo(() => {
    return [getCardStyle(invitationStatus), itemSeparatorStyle];
  }, [invitationStatus, itemSeparatorStyle]);

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress}>
      {membersCount && <CommunityMembersPill membersCount={membersCount} />}
      {invitationStatus === InvitationStatus.PENDING && <CommunityInvitationBadge />}
      <ModuleImage moduleConfig={moduleConfig} {...imageProps} style={styles.imgContainer} />
      <View style={styles.titleContainer}>
        <BodyBoldText numberOfLines={1} ellipsizeMode="tail">
          {title}
        </BodyBoldText>
      </View>
    </TouchableOpacity>
  );
};
