import React from 'react';
import { Image as RNImage, View } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import styles from './styles';
import { ImageItemProps } from './types';

import LoaderItem from '~/framework/components/carousel-multimedia/loader-item/component';
import { PAGINATION_COMPONENT_HEIGHT, SCREEN_HEIGHT } from '~/framework/components/carousel-multimedia/styles';

/**
 * PanGesture recognizes drag movements on an image
 * When panGesture = true, it overrides the carousel swipe gesture,
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
  showNavBar,
  source,
  toggleNavBarVisibility,
}: ImageItemProps) => {
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [isPanEnabled, setIsPanEnabled] = React.useState(false);
  const [realImageDimensions, setRealImageDimensions] = React.useState({
    height: containerHeight,
    width: containerWidth,
  });
  const scale = useSharedValue(MIN_IMAGE_SCALE);
  const savedScale = useSharedValue(MIN_IMAGE_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Retrieve the actual size of the image (and not the container's), necessary because of resizeMode="contain"
  React.useEffect(() => {
    const resolvedSource = RNImage.resolveAssetSource(source);

    if (resolvedSource && resolvedSource.width && resolvedSource.height) {
      const originalWidth = resolvedSource.width;
      const originalHeight = resolvedSource.height;

      // Calculate dimensions corresponding to resizeMode="contain"
      const aspectRatio = originalWidth / originalHeight;
      const containerAspectRatio = containerWidth / containerHeight;

      let finalWidth: number, finalHeight: number;

      if (aspectRatio > containerAspectRatio) {
        // Image wider than container -> constrained by width
        finalWidth = containerWidth;
        finalHeight = containerWidth / aspectRatio;
      } else {
        // Image taller than container -> constrained by height
        finalHeight = containerHeight;
        finalWidth = containerHeight * aspectRatio;
      }

      setRealImageDimensions({
        height: finalHeight,
        width: finalWidth,
      });
    }
  }, [source, containerWidth, containerHeight]);

  // Allows to calculate the max translation limits based on the current scale to know if you can swipe in carousel or not
  const calculateLimits = React.useCallback(
    (currentScale: number) => {
      'worklet';

      if (currentScale <= MIN_IMAGE_SCALE) {
        return { maxTranslateX: 0, maxTranslateY: 0 };
      }

      const scaledWidth = realImageDimensions.width * currentScale;
      const scaledHeight = realImageDimensions.height * currentScale;
      // If the image, once zoomed, is smaller than the container, no movement allowed ( = limits to 0)
      const maxTranslateX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const maxTranslateY = Math.max(0, (scaledHeight - containerHeight) / 2);

      return { maxTranslateX, maxTranslateY };
    },
    [realImageDimensions.width, realImageDimensions.height, containerWidth, containerHeight],
  );

  const pinchGesture = React.useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate(event => {
          scale.value = Math.max(MIN_IMAGE_SCALE, Math.min(MAX_IMAGE_SCALE, savedScale.value * event.scale));
        })
        .onEnd(() => {
          savedScale.value = Math.max(MIN_IMAGE_SCALE, Math.min(MAX_IMAGE_SCALE, scale.value));
          if (scale.value <= MIN_IMAGE_SCALE) {
            runOnJS(setIsPanEnabled)(false);
          } else {
            runOnJS(setIsPanEnabled)(true);
          }

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
        }),
    [calculateLimits, savedScale, savedTranslateX, savedTranslateY, scale, translateX, translateY],
  );

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(isPanEnabled)
        .onUpdate(event => {
          if (scale.value <= MIN_IMAGE_SCALE) return;
          const isInPaginationZone = event.absoluteY > SCREEN_HEIGHT - PAGINATION_COMPONENT_HEIGHT;
          if (isInPaginationZone) return;

          const { maxTranslateX, maxTranslateY } = calculateLimits(scale.value);
          const newTranslateX = savedTranslateX.value + event.translationX;
          const newTranslateY = savedTranslateY.value + event.translationY;
          translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
          translateY.value = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
        })
        .onEnd(() => {
          if (scale.value <= MIN_IMAGE_SCALE) {
            return;
          }
          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        }),
    [calculateLimits, isPanEnabled, savedTranslateX, savedTranslateY, scale.value, translateX, translateY],
  );

  const singleTapGesture = React.useMemo(() => {
    return Gesture.Tap()
      .maxDuration(250)
      .maxDistance(10)
      .numberOfTaps(1)
      .onStart(event => {
        'worklet';
        const isInPaginationZone = event.absoluteY > SCREEN_HEIGHT - PAGINATION_COMPONENT_HEIGHT;
        if (isInPaginationZone) return;
        runOnJS(toggleNavBarVisibility)();
      });
  }, [toggleNavBarVisibility]);

  const doubleTapGesture = React.useMemo(() => {
    return Gesture.Tap()
      .maxDuration(250)
      .numberOfTaps(2)
      .onStart(event => {
        'worklet';

        const isInPaginationZone = event.absoluteY > SCREEN_HEIGHT - PAGINATION_COMPONENT_HEIGHT;
        if (isInPaginationZone) return;

        const currentScale = Math.round(scale.value);
        let newScale: number;

        isNavBarVisible && runOnJS(hideNavBar)();
        !isNavBarVisible && currentScale >= MAX_IMAGE_SCALE && runOnJS(showNavBar)();

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

        if (newScale <= MIN_IMAGE_SCALE) {
          runOnJS(setIsPanEnabled)(false);
          // Recenter image
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          savedTranslateX.value = 0;
          savedTranslateY.value = 0;
        } else {
          runOnJS(setIsPanEnabled)(true);
          // Recalculate limits based on new scale
          const { maxTranslateX, maxTranslateY } = calculateLimits(newScale);
          const clampedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value));
          const clampedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value));
          translateX.value = withSpring(clampedX);
          translateY.value = withSpring(clampedY);

          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        }
      });
  }, [
    calculateLimits,
    hideNavBar,
    isNavBarVisible,
    savedScale,
    savedTranslateX,
    savedTranslateY,
    scale,
    showNavBar,
    translateX,
    translateY,
  ]);

  // Gesture.Exclusive gives priority to double tap gesture
  const tapGestures = Gesture.Exclusive(doubleTapGesture, singleTapGesture);
  const combinedGesture = Gesture.Simultaneous(pinchGesture, panGesture, tapGestures);

  const animatedStyle = useAnimatedStyle(() => {
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
      setIsPanEnabled(false);
    }
  }, [isShown, scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.Image
          source={source}
          resizeMode={'contain'}
          style={[styles.img, animatedStyle]}
          onLoadEnd={() => setIsImageLoading(false)}
        />
      </GestureDetector>
      {isImageLoading && <LoaderItem />}
    </View>
  );
};

export default ImageItem;
