import * as React from 'react';
import { View } from 'react-native';

import { SmallBoldText, SmallText } from '~/framework/components/text';
import { AccountTypeText } from '~/framework/components/text/account-type';

import styles from './styles';
import { AuthorLineProps } from './types';

const SEPARATOR = '-';

const AuthorLine = ({ bold = true, name, profile, style }: Readonly<AuthorLineProps>) => {
  const AuthorName = bold ? SmallBoldText : SmallText;

  return (
    <View style={[styles.container, style]}>
      <AuthorName numberOfLines={1} style={styles.name}>
        {name}
      </AuthorName>
      <SmallText style={styles.separator}>{SEPARATOR}</SmallText>
      <AccountTypeText style={styles.profile} type={profile} />
    </View>
  );
};

export default React.memo(AuthorLine);
