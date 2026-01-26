import React from 'react';
import { TextProps } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { NestedText } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';

const profilesI18n: Record<AccountType, string> = {
  [AccountType.Guest]: 'user-profiletypes-guest',
  [AccountType.Personnel]: 'user-profiletypes-personnel',
  [AccountType.Relative]: 'user-profiletypes-relative',
  [AccountType.Student]: 'user-profiletypes-student',
  [AccountType.Teacher]: 'user-profiletypes-teacher',
  [AccountType.External]: 'user-profiletypes-external',
};

export const AccountTypeText = ({
  TextComponent = NestedText,
  type,
}: {
  type: AccountType;
  TextComponent?: React.ComponentType<TextProps>;
}) => {
  const profileStyle = React.useMemo(() => ({ color: theme.color.profileTypes[type] }), [type]);
  return <TextComponent style={profileStyle}>{I18n.get(profilesI18n[type])}</TextComponent>;
};
