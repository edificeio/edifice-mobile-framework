import React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import styles from '~/framework/modules/communities/components/member-list-item/styles';

const MemberListItemLoader = () => {
  return (
    <View style={styles.container}>
      <Placeholder Animation={Fade}>
        <PlaceholderLine noMargin style={styles.loaderFirstLine} />
        <PlaceholderLine noMargin style={styles.loaderSecondLine} />
      </Placeholder>
    </View>
  );
};

export default MemberListItemLoader;
