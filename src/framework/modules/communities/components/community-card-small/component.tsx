import * as React from 'react';
import { ImageStyle, TouchableOpacity, View } from 'react-native';

import { InvitationStatus } from '@edifice.io/community-client-rest-rn';

import { styles } from './styles';
import { CommunityCardSmallProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import ModuleImage from '~/framework/components/picture/module-image';
import { BodyBoldText, SmallBoldText } from '~/framework/components/text';
import CommunityMembersPill from '~/framework/modules/communities/components/community-members-pill/';
import http from '~/framework/util/http';

export const CommunityCardSmall = ({
  image,
  invitationStatus,
  membersCount,
  moduleConfig,
  onPress,
  title,
}: CommunityCardSmallProps) => {
  const imageProps = React.useMemo(() => {
    return image ? http.imagePropsForSession({ source: { uri: image } }) : undefined;
  }, [image]);

  const smallCardStyle: ImageStyle = React.useMemo(() => {
    switch (invitationStatus) {
      case InvitationStatus.PENDING:
        return {
          borderColor: theme.palette.status.failure.light,
          borderWidth: UI_SIZES.border.small,
        };
      case InvitationStatus.ACCEPTED || InvitationStatus.REQUEST_ACCEPTED:
        return {
          borderColor: theme.palette.grey.cloudy,
          borderWidth: UI_SIZES.border.thin,
        };
      default:
        return {
          borderColor: theme.palette.grey.cloudy,
          borderWidth: UI_SIZES.border.thin,
        };
    }
  }, [invitationStatus]);

  const renderNewInvitationBadge = React.useCallback(() => {
    if (invitationStatus === InvitationStatus.PENDING) {
      return (
        <View style={styles.badgeContainer}>
          <SmallBoldText style={styles.badgeText}>{I18n.get('communities-badge-new')}</SmallBoldText>
        </View>
      );
    }
    return undefined;
  }, [invitationStatus]);

  return (
    <TouchableOpacity style={[styles.cardContainer, smallCardStyle]} onPress={onPress}>
      <CommunityMembersPill membersCount={membersCount} />
      {renderNewInvitationBadge()}
      <ModuleImage moduleConfig={moduleConfig} {...imageProps} style={styles.imgContainer} />
      <View style={styles.titleContainer}>
        <BodyBoldText numberOfLines={1} ellipsizeMode="tail">
          {title}
        </BodyBoldText>
      </View>
    </TouchableOpacity>
  );
};
