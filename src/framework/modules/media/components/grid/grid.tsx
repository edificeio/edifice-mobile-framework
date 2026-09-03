import React from 'react';
import { View } from 'react-native';

import { NavigationProp } from '@react-navigation/native';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

import { NavigationRootParams } from '~/app/navigation/types';
import { UI_SIZES } from '~/framework/components/constants';
import { Media, openMedias, toURISource } from '~/framework/modules/media';

import { MediaItem } from './item';
import styles from './styles';

export interface MediaGridProps {
  media?: Media[];
  navigation: NavigationProp<NavigationRootParams>;
}

export function MediaGrid({ media = MediaGrid.EMPTY_MEDIA, navigation }: Readonly<MediaGridProps>) {
  const isSingle = media.length === 1;
  const [itemHeight, setItemHeight] = React.useState(0);
  const onLayout = React.useCallback<NonNullable<ViewProps['onLayout']>>(({ nativeEvent }) => {
    setItemHeight(
      (nativeEvent.layout.width - 2 * styles.item.padding + 2 * styles.grid.margin) / 2 / UI_SIZES.aspectRatios.thumbnail +
        2 * styles.item.padding,
    );
  }, []);
  const itemStyle: ViewProps['style'] = React.useMemo(() => [styles.item, { height: itemHeight }], [itemHeight]);
  return (
    <View style={styles.grid} onLayout={onLayout}>
      {media.map(
        React.useCallback(
          (item, index) => (
            <MediaItem
              key={toURISource(item.src).uri}
              media={item}
              style={itemStyle}
              testID={`media-grid-${index}`}
              onPress={() => {
                openMedias(navigation, media, index);
              }}
            />
          ),
          [itemStyle, media, navigation],
        ),
      )}
      {!isSingle && <View style={styles.item} />}
    </View>
  );
}
MediaGrid.EMPTY_MEDIA = [] as NonNullable<MediaGridProps['media']>;
