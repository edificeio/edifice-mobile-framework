import * as React from 'react';
import { TextProps } from 'react-native';

import { SmallBoldText } from '.';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { AccountType } from '~/framework/modules/auth/model';

export const i18nAccountTypes = {
  [AccountType.Guest]: 'user-profiletypes-guest',
  [AccountType.Personnel]: 'user-profiletypes-personnel',
  [AccountType.Relative]: 'user-profiletypes-relative',
  [AccountType.Student]: 'user-profiletypes-student',
  [AccountType.Teacher]: 'user-profiletypes-teacher',
};

export const getProfileColorStyle = (type: AccountType) => ({
  color: theme.color.profileTypes[type],
});

export const getProfileString = (type: AccountType) => I18n.get(i18nAccountTypes[type]);

export const AccountTypeText = (props: { type: AccountType } & TextProps) => {
  const { style, type, ...textProps } = props;
  const realStyle = React.useMemo(() => [getProfileColorStyle(type), style], [style, type]);
  return (
    <SmallBoldText {...textProps} style={realStyle}>
      {getProfileString(type)}
    </SmallBoldText>
  );
};
