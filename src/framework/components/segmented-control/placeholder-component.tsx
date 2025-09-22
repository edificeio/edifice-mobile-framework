import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import { styles } from './styles';

const SegmentedControlLoader = () => {
  return (
    <View style={styles.loaderContainer}>
      <Placeholder Animation={Fade}>
        <PlaceholderLine noMargin style={styles.loaderContent} />
      </Placeholder>
    </View>
  );
};

export default SegmentedControlLoader;
