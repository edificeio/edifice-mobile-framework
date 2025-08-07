import * as React from 'react';
import { View } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';

import styles from './styles';
import { MemberListItemProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';

const rolesI18n: Record<MembershipRole, string> = {
  [MembershipRole.ADMIN]: 'communities-role-admin',
  [MembershipRole.MEMBER]: 'communities-role-member',
};

const profilesI18n: Record<AccountType, string> = {
  [AccountType.Guest]: 'user-profiletypes-guest',
  [AccountType.Personnel]: 'user-profiletypes-personnel',
  [AccountType.Relative]: 'user-profiletypes-relative',
  [AccountType.Student]: 'user-profiletypes-student',
  [AccountType.Teacher]: 'user-profiletypes-teacher',
};

const MemberListItem = ({ name, profileType, role }: Readonly<MemberListItemProps>) => {
  const profileStyle = React.useMemo(() => ({ color: theme.color.profileTypes[profileType] }), [profileType]);
  return (
    <View style={styles.container}>
      <SmallBoldText numberOfLines={1}>{name}</SmallBoldText>
      <View style={styles.containerText}>
        <SmallBoldText style={profileStyle}>{I18n.get(profilesI18n[profileType])}</SmallBoldText>
        <View style={styles.separator}>
          <SmallBoldText>|</SmallBoldText>
        </View>
        <SmallText>{I18n.get(rolesI18n[role])}</SmallText>
      </View>
    </View>
  );
};

export default MemberListItem;
