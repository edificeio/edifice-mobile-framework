import React from 'react';
import { ImageLoadEvent, View } from 'react-native';

import {
  GestureDetector,
  useExclusiveGestures,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import LoaderItem from '~/framework/components/carousel/components/items/loader-item/component';
import { PAGINATION_COMPONENT_HEIGHT } from '~/framework/components/carousel/components/pagination/styles';
import { UI_SIZES } from '~/framework/components/constants';

import styles from './styles';
import { ImageItemProps } from './types';

/**
 * PanGesture recognizes drag movements on an image
 * When isPanEnabled = true, it overrides the carousel swipe gesture,
 * which means it cancels the ability to swipe in the carousel while the image is zoomed
 */

const MIN_IMAGE_SCALE = 1;
const MID_IMAGE_SCALE = 3;
const MAX_IMAGE_SCALE = 5;

const ImageItem = ({
  containerHeight,
  containerWidth,
  hideNavBar,
  isNavBarVisible,
  isShown,
  setIsImageError,
  showNavBar,
  source,
  toggleNavBarVisibility,
}: ImageItemProps) => {
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  // Rendered image size (resizeMode="contain"), stored as SharedValues so gesture worklets always read the latest value
  const realImageHeight = useSharedValue(containerHeight);
  const realImageWidth = useSharedValue(containerWidth);
  // SharedValue (instead of React state) so it can be written directly from the UI thread, without re-render
  const isPanEnabled = useSharedValue(false);
  const scale = useSharedValue(MIN_IMAGE_SCALE);
  const savedScale = useSharedValue(MIN_IMAGE_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const onImageLoadEnd = React.useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const onImageError = React.useCallback(() => {
    setIsImageLoading(false);
    setIsImageError(true);
  }, [setIsImageError]);

  // Retrieve the actual size of the image (and not the container's), necessary because of resizeMode="contain"
  // onLoad provides the intrinsic size of the downloaded image (works for remote URIs, unlike Image.resolveAssetSource)
  const onImageLoad = React.useCallback(
    (event: ImageLoadEvent) => {
      const { height: originalHeight, width: originalWidth } = event.nativeEvent.source;
      if (!originalWidth || !originalHeight) return;

      // Calculate dimensions corresponding to resizeMode="contain"
      const aspectRatio = originalWidth / originalHeight;
      const containerAspectRatio = containerWidth / containerHeight;

      if (aspectRatio > containerAspectRatio) {
        // Image wider than container -> constrained by width
        realImageWidth.value = containerWidth;
        realImageHeight.value = containerWidth / aspectRatio;
      } else {
        // Image taller than container -> constrained by height
        realImageHeight.value = containerHeight;
        realImageWidth.value = containerHeight * aspectRatio;
      }
    },
    [containerHeight, containerWidth, realImageHeight, realImageWidth],
  );

  // Allows to calculate the max translation limits based on the current scale to know if you can swipe in carousel or not
  const calculateLimits = React.useCallback(
    (currentScale: number) => {
      'worklet';

      if (currentScale <= MIN_IMAGE_SCALE) {
        return { maxTranslateX: 0, maxTranslateY: 0 };
      }

      const scaledWidth = realImageWidth.value * currentScale;
      const scaledHeight = realImageHeight.value * currentScale;
      // If the image, once zoomed, is smaller than the container, no movement allowed ( = limits to 0)
      const maxTranslateX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const maxTranslateY = Math.max(0, (scaledHeight - containerHeight) / 2);

      return { maxTranslateX, maxTranslateY };
    },
    [realImageWidth, realImageHeight, containerWidth, containerHeight],
  );

  // Callbacks defined inline in gesture hooks config are automatically workletized (run on UI thread)
  const pinchGesture = usePinchGesture({
    onDeactivate: () => {
      savedScale.value = Math.max(MIN_IMAGE_SCALE, Math.min(MAX_IMAGE_SCALE, scale.value));
      isPanEnabled.value = scale.value > MIN_IMAGE_SCALE;

      if (scale.value <= MIN_IMAGE_SCALE) {
        // Center image after dezoom
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Recalculate limits after pinch
        const { maxTranslateX, maxTranslateY } = calculateLimits(scale.value);
        const clampedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value));
        const clampedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value));
        translateX.value = withSpring(clampedX);
        translateY.value = withSpring(clampedY);

        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    },
    onUpdate: event => {
      scale.value = Math.max(MIN_IMAGE_SCALE, Math.min(MAX_IMAGE_SCALE, savedScale.value * event.scale));
    },
  });

  const panGesture = usePanGesture({
    enabled: isPanEnabled,
    onDeactivate: () => {
      if (scale.value <= MIN_IMAGE_SCALE) return;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    },
    onUpdate: event => {
      if (scale.value <= MIN_IMAGE_SCALE) return;
      const isInPaginationZone = event.absoluteY > UI_SIZES.screen.height - PAGINATION_COMPONENT_HEIGHT;
      if (isInPaginationZone) return;

      const { maxTranslateX, maxTranslateY } = calculateLimits(scale.value);
      const newTranslateX = savedTranslateX.value + event.translationX;
      const newTranslateY = savedTranslateY.value + event.translationY;
      translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
      translateY.value = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
    },
  });

  const singleTapGesture = useTapGesture({
    maxDistance: 10,
    maxDuration: 350,
    numberOfTaps: 1,
    onActivate: event => {
      const isInPaginationZone = event.absoluteY > UI_SIZES.screen.height - PAGINATION_COMPONENT_HEIGHT;
      if (isInPaginationZone) return;
      scheduleOnRN(toggleNavBarVisibility);
    },
  });

  const doubleTapGesture = useTapGesture({
    maxDuration: 250,
    numberOfTaps: 2,
    onActivate: event => {
      const isInPaginationZone = event.absoluteY > UI_SIZES.screen.height - PAGINATION_COMPONENT_HEIGHT;
      if (isInPaginationZone) return;

      const currentScale = Math.round(scale.value);
      let newScale: number;

      isNavBarVisible && scheduleOnRN(hideNavBar);
      !isNavBarVisible && currentScale >= MAX_IMAGE_SCALE && scheduleOnRN(showNavBar);

      if (currentScale <= MIN_IMAGE_SCALE) {
        newScale = MID_IMAGE_SCALE;
      } else if (currentScale < MAX_IMAGE_SCALE) {
        newScale = MAX_IMAGE_SCALE;
      } else {
        newScale = MIN_IMAGE_SCALE;
      }

      // use withTiming instead of withSpring for a smoother zoom
      scale.value = withTiming(newScale, { duration: 300 });
      savedScale.value = newScale;
      isPanEnabled.value = newScale > MIN_IMAGE_SCALE;

      if (newScale <= MIN_IMAGE_SCALE) {
        // Recenter image
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Recalculate limits based on new scale
        const { maxTranslateX, maxTranslateY } = calculateLimits(newScale);
        const clampedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value));
        const clampedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value));
        translateX.value = withSpring(clampedX);
        translateY.value = withSpring(clampedY);

        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    },
  });

  // useExclusiveGestures gives priority to double tap gesture
  const tapGestures = useExclusiveGestures(doubleTapGesture, singleTapGesture);
  const combinedGesture = useSimultaneousGestures(pinchGesture, panGesture, tapGestures);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    // Calculate translations considering the current scale
    const adjustedTranslateX = scale.value > MIN_IMAGE_SCALE ? translateX.value / scale.value : 0;
    const adjustedTranslateY = scale.value > MIN_IMAGE_SCALE ? translateY.value / scale.value : 0;

    return {
      transform: [{ scale: scale.value }, { translateX: adjustedTranslateX }, { translateY: adjustedTranslateY }],
      transformOrigin: 'center',
    };
  });

  // RN Reanimated Carousel does not unmount components, so we use isShown to reset the state when the image is not displayed
  React.useEffect(() => {
    if (!isShown) {
      scale.value = MIN_IMAGE_SCALE;
      savedScale.value = MIN_IMAGE_SCALE;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      isPanEnabled.value = false;
    }
  }, [isShown, isPanEnabled, scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.Image
          source={source}
          resizeMode={'contain'}
          style={[styles.img, animatedStyle]}
          onError={onImageError}
          onLoad={onImageLoad}
          onLoadEnd={onImageLoadEnd}
        />
      </GestureDetector>
      {isImageLoading && <LoaderItem />}
    </View>
  );
};

export default React.memo(ImageItem);
