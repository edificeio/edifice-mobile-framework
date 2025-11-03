import * as React from 'react';
import { View } from 'react-native';

import { styles } from './styles';
import { GridMediaCardProps } from './types';

import SingleMediaCard from '~/framework/components/card/media/single';

const GridMediaCard = ({ media }: Readonly<GridMediaCardProps>) => {
  return (
    <View style={styles.container}>
      {media.map((item, index) => {
        return (
          <View key={index} style={styles.gridItem}>
            <SingleMediaCard media={item} />
          </View>
        );
      })}
    </View>
  );
};

export default GridMediaCard;
