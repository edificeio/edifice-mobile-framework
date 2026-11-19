import * as React from 'react';
import { TextProps } from 'react-native';

import theme from '~/app/theme';
import { NestedText } from '~/framework/components/text';
import { AccountType } from '~/modules/auth/model';
import { I18n } from '~/util/i18n';

/** i18n keys of the names of the account types. */
export const i18nAccountTypes: Record<AccountType, string> = {
  [AccountType.Guest]: 'user-profiletypes-guest',
  [AccountType.Personnel]: 'user-profiletypes-personnel',
  [AccountType.Relative]: 'user-profiletypes-relative',
  [AccountType.Student]: 'user-profiletypes-student',
  [AccountType.Teacher]: 'user-profiletypes-teacher',
  [AccountType.External]: 'user-profiletypes-external',
};

/**
 * Name of the account type, in its color. A `NestedText` by default, to be nested in another text: give another `TextComponent`
 * (e.g. `SmallBoldText`) to render it on its own.
 */
export const AccountTypeText = ({
  style,
  TextComponent = NestedText,
  type,
  ...textProps
}: TextProps & {
  type: AccountType;
  TextComponent?: React.ComponentType<TextProps>;
}) => {
  const typeStyle = React.useMemo(() => [{ color: theme.color.profileTypes[type] }, style], [style, type]);
  return (
    <TextComponent {...textProps} style={typeStyle}>
      {I18n.get(i18nAccountTypes[type])}
    </TextComponent>
  );
};
