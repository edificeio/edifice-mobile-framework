import * as React from 'react';
import { ImageURISource, View } from 'react-native';

import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import styles from './styles';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, Svg } from '~/framework/components/picture';
import { FileMedia, isAudioContent, isImageContent, isPdfContent, isVideoContent } from '~/framework/util/media';

interface PaginationItemProps {
  item: FileMedia;
  index: number;
  thumbnailSrc?: ImageURISource;
  paginationProgress: SharedValue<number>;
}

const PaginationItem = ({ index, item, paginationProgress, thumbnailSrc }: PaginationItemProps) => {
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(paginationProgress.value - index);

    const scale = interpolate(
      distance,
      [0, 1],
      [1, UI_SIZES.elements.icon.xsmall / UI_SIZES.elements.icon.default],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(distance, [0, 10], [1, 0], Extrapolation.CLAMP);

    return {
      opacity,
      transform: [
        { translateX: -(UI_SIZES.elements.icon.default / 2) },
        { translateY: -(UI_SIZES.elements.icon.default / 2) },
        { scale },
      ],
    };
  });

  if (item.mime && isImageContent(item) && thumbnailSrc) {
    return (
      <View style={styles.itemContainer}>
        <Picture type="Image" source={thumbnailSrc} style={styles.thumbnail} resizeMode="cover" />
      </View>
    );
  }

  if (item.mime && isVideoContent(item) && thumbnailSrc) {
    return (
      <View style={styles.itemContainer}>
        {thumbnailSrc && <Picture type="Image" source={thumbnailSrc} style={styles.thumbnail} resizeMode="cover" />}
        <Animated.View style={[styles.videoIcon, iconAnimatedStyle]}>
          <Svg
            name="ui-recordVideo"
            fill={theme.palette.grey.white}
            height={UI_SIZES.elements.icon.default}
            width={UI_SIZES.elements.icon.default}
          />
        </Animated.View>
      </View>
    );
  }

  if (item.mime && isAudioContent(item)) {
    return (
      <View style={styles.itemContainer}>
        <Animated.View style={[styles.videoIcon, iconAnimatedStyle]}>
          <Svg
            name="ui-audio"
            fill={theme.palette.grey.white}
            height={UI_SIZES.elements.icon.default}
            width={UI_SIZES.elements.icon.default}
          />
        </Animated.View>
      </View>
    );
  }

  if ((item.mime && isPdfContent(item)) || !item.mime) {
    return (
      <View style={styles.itemContainer}>
        <Animated.View style={[styles.videoIcon, iconAnimatedStyle]}>
          <Svg
            name="ui-text-page"
            fill={theme.palette.grey.white}
            height={UI_SIZES.elements.icon.default}
            width={UI_SIZES.elements.icon.default}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.itemContainer}>
      <Animated.View style={[styles.videoIcon, iconAnimatedStyle]}>
        <Svg
          name="image-not-found"
          fill={theme.palette.grey.white}
          height={UI_SIZES.elements.icon.default}
          width={UI_SIZES.elements.icon.default}
        />
      </Animated.View>
    </View>
  );
};

export default PaginationItem;
