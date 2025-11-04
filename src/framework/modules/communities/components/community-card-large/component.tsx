import * as React from 'react';
import { View } from 'react-native';

import RNSvg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { styles } from './styles';
import { CommunityCardLargeProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { SingleAvatar } from '~/framework/components/avatar';
import { Svg } from '~/framework/components/picture';
import ModuleImage from '~/framework/components/picture/module-image';
import { BodyBoldText, BodyText, NestedBoldText, SmallText } from '~/framework/components/text';
import CommunityMembersPill from '~/framework/modules/communities/components/community-members-pill/';
import { rolesI18n } from '~/framework/modules/communities/model';
import moduleConfig from '~/framework/modules/communities/module-config';
import http from '~/framework/util/http';

export const CommunityCardLarge = ({
  image,
  membersCount,
  role,
  senderId,
  senderName,
  title,
}: Readonly<CommunityCardLargeProps>) => {
  const imageProps = React.useMemo(() => (image ? http.imagePropsForSession({ source: { uri: image } }) : undefined), [image]);

  return (
    <View style={styles.card}>
      {membersCount && <CommunityMembersPill membersCount={membersCount} />}
      <ModuleImage moduleConfig={moduleConfig} {...imageProps} style={styles.imgContainer} />
      <View>
        <RNSvg style={styles.infoBackground}>
          <Defs>
            <LinearGradient id="backgroundGradient" x1={0} y1={0} x2={1} y2={1}>
              <Stop offset="0" stopColor={theme.palette.primary.dark} />
              <Stop offset="1" stopColor={theme.palette.primary.regular} />
            </LinearGradient>
          </Defs>
          <Rect x="0%" y="0%" width="100%" height="100%" fill="url(#backgroundGradient)" />
        </RNSvg>
        <View style={styles.infoContainer}>
          <View style={styles.metadataContainer}>
            <BodyBoldText numberOfLines={1} ellipsizeMode="tail" style={styles.infoText}>
              {title}
            </BodyBoldText>
            <View style={styles.infoRoleContainer}>
              <Svg name="ui-user-join" fill={theme.ui.text.inverse} />
              <BodyText style={styles.infoText}>
                {I18n.get('community-invitation-role-label')}
                <NestedBoldText style={styles.infoText}>{I18n.get(rolesI18n[role])}</NestedBoldText>
              </BodyText>
            </View>
          </View>
          <View style={styles.infoSeparator} />
          <View style={styles.infoInviterContainer}>
            <SingleAvatar userId={senderId} size="sm" />
            <SmallText style={styles.infoInviterText}>
              {I18n.get('community-invitation-from-label', { name: senderName })}
            </SmallText>
          </View>
        </View>
      </View>
    </View>
  );
};
