import * as React from 'react';
import { Platform, View } from 'react-native';

import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { getSignedPosterSource } from '~/framework/components/carousel/utils';
import { UI_SIZES } from '~/framework/components/constants';
import { FileMedia, isImageContent, isPlayableMedia } from '~/framework/modules/media';

import { CustomPagination } from './custom-pagination';
import PaginationBackground from './pagination-background/component';
import PaginationItem from './pagination-item/component';
import styles, { ACTIVE_ITEM_WIDTH, INACTIVE_ITEM_WIDTH, ITEM_GAP, PAGINATION_COMPONENT_HEIGHT } from './styles';
import { CarouselPaginationProps } from './types';

import { PAGINATION_ANIMATION_OFFSET } from '~/framework/components/carousel/constants';

const MAX_PAGINATION_ITEMS = 12;

const getPaginationItemAnimatedStyle = (progress: number, index: number, length: number) => {
  'worklet';
  let distanceToActiveItem = Math.abs(progress - index);
  if (index === 0 && progress > length - 1) {
    distanceToActiveItem = Math.abs(progress - length);
  }

  return {
    marginHorizontal: interpolate(distanceToActiveItem, [1, 0], [0, ITEM_GAP], Extrapolation.CLAMP),
    opacity: interpolate(distanceToActiveItem, [0, 10], [1, 0], Extrapolation.CLAMP),
  };
};

const CarouselPagination = ({
  bottomInset,
  carouselRef,
  containerWidth,
  containerWidthShared,
  isInitialAVMediaLoaded,
  isNavBarVisible,
  isPaginationVisible,
  media,
  mediaLengthShared,
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

  const paginationContainerStyle = React.useMemo(
    () => [styles.paginationGradient, { height: PAGINATION_COMPONENT_HEIGHT + bottomInset, paddingBottom: bottomInset }],
    [bottomInset],
  );

  const renderPaginationItem = React.useCallback(
    (item: FileMedia, index: number) => {
      const thumbnailSrc =
        item.mime && isImageContent(item) && item.src
          ? getSignedPosterSource(item.src, UI_SIZES.elements.thumbnailFetchSize.small)
          : item.mime && isPlayableMedia(item) && item.poster
            ? getSignedPosterSource(item.poster, UI_SIZES.elements.thumbnailFetchSize.small)
            : undefined;

      return (
        <PaginationItem
          item={item}
          count={media.length}
          loop={media.length > 2}
          thumbnailSrc={thumbnailSrc}
          index={index}
          paginationProgress={paginationProgress}
          testID={`media-pagination-${index}`}
        />
      );
    },
    [media.length, paginationProgress],
  );

  const onPressPagination = React.useCallback(
    (index: number) => {
      // v5 resolves the shortest path itself when looping, so we only pass the target index.
      carouselRef.current?.scrollTo({ animated: true, index });
    },
    [carouselRef],
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
    const length = mediaLengthShared.value;
    const raw = paginationProgress.value;
    const progress = length > 0 ? ((raw % length) + length) % length : raw;
    const distanceToActiveItem = progress > length - 0.5 ? progress - length : progress;

    const screenCenter = containerWidthShared.value / 2;

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
  }, [containerWidthShared]);

  if (!canShowPagination) {
    return null;
  }

  return (
    <View style={paginationContainerStyle} pointerEvents="box-none">
      <Animated.View style={paginationContainerAnimatedStyle}>
        <PaginationBackground
          key={Platform.OS === 'ios' ? containerWidth : undefined}
          width={containerWidth}
          height={PAGINATION_COMPONENT_HEIGHT + bottomInset}
        />
        <Animated.View style={paginationItemsAnimatedStyle}>
          <CustomPagination
            containerStyle={styles.paginationContainer}
            data={media}
            loop={media.length > 2}
            onPress={onPressPagination}
            progress={paginationProgress}
            renderItem={renderPaginationItem}
            size={INACTIVE_ITEM_WIDTH}
            dotStyle={styles.paginationDot}
            activeDotStyle={styles.paginationActiveDot}
            customReanimatedStyle={getPaginationItemAnimatedStyle}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default React.memo(CarouselPagination);
