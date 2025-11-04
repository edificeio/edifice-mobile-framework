import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import styles from '~/framework/modules/communities/components/members-list-count/styles';

const MembersListCountLoader = () => {
  return (
    <View style={styles.container}>
      <Placeholder Animation={Fade}>
        <PlaceholderLine noMargin style={styles.loaderContent} />
      </Placeholder>
    </View>
  );
};

export default MembersListCountLoader;
