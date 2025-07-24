import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderMedia } from 'rn-placeholder';

import { styles } from './styles';

const CommunityCardSmallLoader: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      <Placeholder Animation={Fade}>
        <PlaceholderMedia style={styles.card} />
      </Placeholder>
    </View>
  );
};

export default CommunityCardSmallLoader;
