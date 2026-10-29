import React from 'react';
import { View } from 'react-native';

import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

import { UI_SIZES } from '~/framework/components/constants';
import { useOpenMedia } from '~/modules/media/hooks/open-media';
import type { Media } from '~/modules/media/types';
import { toURISource } from '~/modules/media/util';

import { MediaItem } from './item';
import styles from './styles';

export interface MediaGridProps {
  media?: Media[];
  /** @deprecated Not used anymore: medias open with the navigation of the screen. */
  navigation?: unknown;
}

export function MediaGrid({ media = MediaGrid.EMPTY_MEDIA }: Readonly<MediaGridProps>) {
  const { openMedias } = useOpenMedia();
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
                openMedias(media, index);
              }}
            />
          ),
          [itemStyle, media, openMedias],
        ),
      )}
      {!isSingle && <View style={styles.item} />}
    </View>
  );
}
MediaGrid.EMPTY_MEDIA = [] as NonNullable<MediaGridProps['media']>;
