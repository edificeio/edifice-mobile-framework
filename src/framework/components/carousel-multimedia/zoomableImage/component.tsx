import React from 'react';
import { Image, View } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import styles from './styles';

interface ZoomableImageProps {
  source: any; // to change later
  containerWidth: number;
  containerHeight: number;
  isShown: boolean;
  onEdgeReached: (direction: 'left' | 'right') => void;
}

const MIN_IMAGE_SCALE = 1;
const MAX_IMAGE_SCALE = 5;
const MIN_SPEED_TO_SWIPE = 1000;
const EDGE_DETECTION_THRESHOLD = 5;

const ZoomableImage = ({ containerHeight, containerWidth, isShown, onEdgeReached, source }: ZoomableImageProps) => {
  const [isPanEnabled, setIsPanEnabled] = React.useState(false);
  const [realImageDimensions, setRealImageDimensions] = React.useState({
    height: containerHeight,
    width: containerWidth,
  });
  const hasSwiped = React.useRef(false);
  const scale = useSharedValue(MIN_IMAGE_SCALE);
  const savedScale = useSharedValue(MIN_IMAGE_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // récupérer la taille réelle de l'image (et pas celle du conteneur), nécessaire à cause de resizeMode="contain"
  // @todo : gérer les images avec uri et pas import local
  React.useEffect(() => {
    const resolvedSource = Image.resolveAssetSource(source);

    if (resolvedSource && resolvedSource.width && resolvedSource.height) {
      const originalWidth = resolvedSource.width;
      const originalHeight = resolvedSource.height;

      // Calcule les dimensions correspondant à resizeMode="contain"
      const aspectRatio = originalWidth / originalHeight;
      const containerAspectRatio = containerWidth / containerHeight;

      let finalWidth: number, finalHeight: number;

      if (aspectRatio > containerAspectRatio) {
        // Image plus large que le conteneur -> contrainte par la largeur
        finalWidth = containerWidth;
        finalHeight = containerWidth / aspectRatio;
      } else {
        // Image plus haute que le conteneur -> contrainte par la hauteur
        finalHeight = containerHeight;
        finalWidth = containerHeight * aspectRatio;
      }

      setRealImageDimensions({
        height: finalHeight,
        width: finalWidth,
      });
    }
  }, [source, containerWidth, containerHeight]);

  const calculateLimits = React.useCallback(
    (currentScale: number) => {
      'worklet';

      if (currentScale <= MIN_IMAGE_SCALE) {
        return { maxTranslateX: 0, maxTranslateY: 0 };
      }

      const scaledWidth = realImageDimensions.width * currentScale;
      const scaledHeight = realImageDimensions.height * currentScale;
      // Si l'image zoomée est plus petite que le conteneur, pas de déplacement autorisé (limites à 0)
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
            // recentrer après dézoom
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
          } else {
            // Recalculer les limites à la fin du pinch
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
        .onBegin(() => {
          hasSwiped.current = false;
        })
        .onUpdate(event => {
          if (scale.value <= MIN_IMAGE_SCALE) {
            return;
          }

          const { maxTranslateX, maxTranslateY } = calculateLimits(scale.value);
          // newTranslateX = accumulation des valeurs de déplacements
          const newTranslateX = savedTranslateX.value + event.translationX;
          const newTranslateY = savedTranslateY.value + event.translationY;

          const isAtRightEdge = Math.abs(translateX.value - -maxTranslateX) < EDGE_DETECTION_THRESHOLD && event.translationX < 0;
          const isAtLeftEdge = Math.abs(translateX.value - maxTranslateX) < EDGE_DETECTION_THRESHOLD && event.translationX > 0;

          if (!hasSwiped.current) {
            if (isAtRightEdge && event.velocityX < -MIN_SPEED_TO_SWIPE) {
              runOnJS(onEdgeReached)('right');
              hasSwiped.current = true;
            } else if (isAtLeftEdge && event.velocityX > MIN_SPEED_TO_SWIPE) {
              runOnJS(onEdgeReached)('left');
              hasSwiped.current = true;
            }
          }

          // Garder le déplacement dans les limites
          translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
          translateY.value = Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY));
        })
        .onEnd(() => {
          // If image is not zoomed, don't save values
          if (scale.value <= MIN_IMAGE_SCALE) {
            return;
          }
          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        }),
    [calculateLimits, isPanEnabled, onEdgeReached, savedTranslateX, savedTranslateY, scale.value, translateX, translateY],
  );

  const doubleTapGesture = React.useMemo(() => {
    return Gesture.Tap()
      .maxDuration(250)
      .numberOfTaps(2)
      .onStart(() => {
        'worklet';

        const currentScale = Math.round(scale.value);
        let newScale: number;

        if (currentScale <= MIN_IMAGE_SCALE) {
          newScale = MAX_IMAGE_SCALE;
        } else {
          newScale = MIN_IMAGE_SCALE;
        }

        // utiliser withTiming au lieu de withSpring pour un zoom plus fluide
        scale.value = withTiming(newScale, { duration: 300 });
        savedScale.value = newScale;

        if (newScale <= MIN_IMAGE_SCALE) {
          runOnJS(setIsPanEnabled)(false);
          // Recentrer l'image
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          savedTranslateX.value = 0;
          savedTranslateY.value = 0;
        } else {
          runOnJS(setIsPanEnabled)(true);
          // Recalculer les limites en fonction du nouveau scale
          const { maxTranslateX, maxTranslateY } = calculateLimits(newScale);
          const clampedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value));
          const clampedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value));
          translateX.value = withSpring(clampedX);
          translateY.value = withSpring(clampedY);

          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        }
      });
  }, [calculateLimits, savedScale, savedTranslateX, savedTranslateY, scale, translateX, translateY]);

  const combinedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    // Calculer les translations en tenant compte du scale actuel
    const adjustedTranslateX = scale.value > MIN_IMAGE_SCALE ? translateX.value / scale.value : 0;
    const adjustedTranslateY = scale.value > MIN_IMAGE_SCALE ? translateY.value / scale.value : 0;

    return {
      transform: [{ scale: scale.value }, { translateX: adjustedTranslateX }, { translateY: adjustedTranslateY }],
      transformOrigin: 'center',
    };
  });

  // RN Carousel ne démonte pas les composants, donc on utilise isShown pour reset l'état quand l'image n'est pas affichée
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
        <Animated.Image source={source} resizeMode={'contain'} style={[styles.img, animatedStyle]} />
      </GestureDetector>
    </View>
  );
};

export default ZoomableImage;
