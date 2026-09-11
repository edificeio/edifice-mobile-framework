import * as React from 'react';
import { View } from 'react-native';

import { SmallBoldText, SmallText } from '~/framework/components/text';
import { AccountTypeText } from '~/framework/components/text/account-type';

import styles from './styles';
import { AuthorLineProps } from './types';

const SEPARATOR = '-';

const AuthorLine = ({ name, profile, style }: Readonly<AuthorLineProps>) => (
  <View style={[styles.container, style]}>
    <SmallBoldText numberOfLines={1} style={styles.name}>
      {name}
    </SmallBoldText>
    <SmallText style={styles.separator}>{SEPARATOR}</SmallText>
    <AccountTypeText style={styles.profile} type={profile} />
  </View>
);

export default React.memo(AuthorLine);
