import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';
import { MembersListCountProps } from './types';

import { I18n } from '~/app/i18n';
import { HeadingXSText } from '~/framework/components/text';

const MembersListCount = ({ count }: Readonly<MembersListCountProps>) => {
  const membersCount = I18n.get('communities-members', { count: count });
  return (
    <View style={styles.container}>
      <HeadingXSText>{membersCount}</HeadingXSText>
    </View>
  );
};

export default MembersListCount;
