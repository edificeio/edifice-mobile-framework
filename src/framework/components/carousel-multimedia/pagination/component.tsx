import * as React from 'react';
import { View } from 'react-native';

import { PORTRAIT } from 'react-native-orientation-locker';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { Pagination } from 'react-native-reanimated-carousel';

import PaginationBackground from './pagination-background/component';
import PaginationItem from './pagination-item/component';
import styles, { ACTIVE_ITEM_WIDTH, INACTIVE_ITEM_WIDTH, ITEM_GAP } from './styles';
import { CarouselPaginationProps } from './types';

import { PAGINATION_ANIMATION_OFFSET } from '~/framework/components/carousel-multimedia/screen';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '~/framework/components/carousel-multimedia/styles';
import { getSignedPosterSource } from '~/framework/components/carousel-multimedia/util';
import { FileMedia, isImageContent, isPlayableMedia } from '~/framework/util/media';

const MAX_PAGINATION_ITEMS = 20;

const CarouselPagination = ({
  carouselRef,
  isInitialAVMediaLoaded,
  isNavBarVisible,
  isPaginationVisible,
  media,
  mediaLengthShared,
  orientationShared,
  paginationProgress,
  paginationTranslateY,
  startIndex,
}: CarouselPaginationProps) => {
  const canShowPagination = React.useMemo(() => {
    return (
      media.length > 1 &&
      media.length <= MAX_PAGINATION_ITEMS &&
      isNavBarVisible &&
      isPaginationVisible &&
      (!isPlayableMedia(media[startIndex]) || isInitialAVMediaLoaded)
    );
  }, [media, isNavBarVisible, isPaginationVisible, startIndex, isInitialAVMediaLoaded]);

  const renderPaginationItem = React.useCallback(
    (item: FileMedia, index: number) => {
      const thumbnailSrc =
        item.mime && isImageContent(item) && item.src
          ? getSignedPosterSource(item.src)
          : item.mime && isPlayableMedia(item) && item.poster
            ? getSignedPosterSource(item.poster)
            : undefined;

      return <PaginationItem item={item} thumbnailSrc={thumbnailSrc} index={index} paginationProgress={paginationProgress} />;
    },
    [paginationProgress],
  );

  const onPressPagination = React.useCallback(
    (index: number) => {
      carouselRef.current?.scrollTo({
        animated: true,
        count: index - paginationProgress.value,
      });
    },
    [paginationProgress, carouselRef],
  );

  const paginationContainerAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: interpolate(paginationTranslateY.value, [0, PAGINATION_ANIMATION_OFFSET], [1, 0]),
      transform: [{ translateY: paginationTranslateY.value }],
    };
  });

  const paginationItemsAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const distanceToActiveItem =
      paginationProgress.value > mediaLengthShared.value - 0.5
        ? paginationProgress.value - mediaLengthShared.value
        : paginationProgress.value;

    const screenCenter = orientationShared.value === PORTRAIT ? SCREEN_WIDTH / 2 : SCREEN_HEIGHT / 2;

    return {
      transform: [
        {
          translateX:
            screenCenter -
            INACTIVE_ITEM_WIDTH -
            ITEM_GAP * 2 -
            ACTIVE_ITEM_WIDTH / 2 +
            interpolate(distanceToActiveItem, [1, 0], [0, INACTIVE_ITEM_WIDTH + ITEM_GAP], Extrapolation.EXTEND),
        },
      ],
    };
  });

  if (!canShowPagination) {
    return null;
  }

  return (
    <View style={styles.paginationGradient} pointerEvents="box-none">
      <Animated.View style={paginationContainerAnimatedStyle}>
        <PaginationBackground />
        <Animated.View style={paginationItemsAnimatedStyle}>
          <Pagination.Custom
            containerStyle={styles.paginationContainer}
            data={media}
            onPress={onPressPagination}
            progress={paginationProgress}
            renderItem={renderPaginationItem}
            size={INACTIVE_ITEM_WIDTH}
            dotStyle={styles.paginationDot}
            activeDotStyle={styles.paginationActiveDot}
            customReanimatedStyle={(progress, index, length) => {
              'worklet';
              let distanceToActiveItem = Math.abs(progress - index);
              if (index === 0 && progress > length - 1) {
                distanceToActiveItem = Math.abs(progress - length);
              }

              return {
                marginHorizontal: interpolate(distanceToActiveItem, [1, 0], [0, ITEM_GAP], Extrapolation.CLAMP),
                opacity: interpolate(distanceToActiveItem, [0, 10], [1, 0], Extrapolation.CLAMP),
              };
            }}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default React.memo(CarouselPagination);
