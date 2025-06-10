import * as React from 'react';
import { View } from 'react-native';

import { Placeholder, PlaceholderLine } from 'rn-placeholder';

import { styles } from './styles';

import { getScaleWidth } from '~/framework/components/constants';

const ResourceDescriptionLoader: React.FC = () => {
  return (
    <View style={styles.cardContainer} testID="wiki-description-loader">
      <Placeholder>
        <PlaceholderLine noMargin height={getScaleWidth(16)} style={styles.linePlaceholder} />
        <PlaceholderLine noMargin height={getScaleWidth(16)} style={styles.linePlaceholder} />
        <PlaceholderLine noMargin height={getScaleWidth(16)} style={styles.tinyLinePlaceholder} />
      </Placeholder>
    </View>
  );
};

export default ResourceDescriptionLoader;
