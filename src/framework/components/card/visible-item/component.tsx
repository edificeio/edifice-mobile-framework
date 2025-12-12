import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';
import { VisibleItemProps } from './types';

import { SingleAvatar } from '~/framework/components/avatar';

const VisibleItem = ({ avatarSize = 'md', backgroundColor, children, rightElement, userId }: Readonly<VisibleItemProps>) => {
  const containerStyle = React.useMemo(() => {
    return [styles.container, backgroundColor && { backgroundColor }];
  }, [backgroundColor]);

  return (
    <View style={containerStyle}>
      <SingleAvatar size={avatarSize} userId={userId} style={styles.flex0} />
      <View style={styles.flex1}>{children}</View>
      {rightElement && <View style={styles.flex0}>{rightElement}</View>}
    </View>
  );
};

export default VisibleItem;
