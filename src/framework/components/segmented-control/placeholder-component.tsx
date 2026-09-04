import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine } from 'rn-placeholder';

import { styles } from './styles';
import { SegmentedControlLoaderProps } from './types';

const SegmentedControlLoader = ({ isFullWidth }: Readonly<SegmentedControlLoaderProps>) => {
  return (
    <View style={[styles.loaderContainer, isFullWidth && styles.loaderContainerFullWidth]}>
      <Placeholder Animation={Fade}>
        <PlaceholderLine noMargin style={[styles.loaderContent, isFullWidth && styles.loaderContentFullWidth]} />
      </Placeholder>
    </View>
  );
};

export default SegmentedControlLoader;
