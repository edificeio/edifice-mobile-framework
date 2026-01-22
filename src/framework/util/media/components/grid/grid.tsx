import React from 'react';
import { View } from 'react-native';

import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

import { MediaItem } from './item';
import styles from './styles';

import { UI_SIZES } from '~/framework/components/constants';
import { AudienceParameter } from '~/framework/modules/audience/types';
import { Media, openMedia, toURISource } from '~/framework/util/media';

export interface MediaGridProps {
  media?: Media[];
  audience?: AudienceParameter;
}

export function MediaGrid({ audience, media = MediaGrid.EMPTY_MEDIA }: Readonly<MediaGridProps>) {
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
          item => (
            <MediaItem
              key={toURISource(item.src).uri}
              media={item}
              style={itemStyle}
              onPress={() => {
                openMedia(item, audience);
              }}
            />
          ),
          [audience, itemStyle],
        ),
      )}
      {!isSingle && <View style={styles.item} />}
    </View>
  );
}
MediaGrid.EMPTY_MEDIA = [] as NonNullable<MediaGridProps['media']>;
