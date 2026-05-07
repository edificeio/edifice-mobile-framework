/**
 * Sticky Component override for community home screen.
 * That component apply the right scroll-based animation knowing the index of the child element.
 *
 * The implementation of this component is based on the code of the default StickyHeaderComponent passed to ScrollView in react-native.
 */

import * as React from 'react';
import { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

// import { isPublicInstance as isFabricPublicInstance } from 'react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstanceUtils';
import type { LayoutChangeEvent } from 'react-native/Libraries/Types/CoreEventTypes';
// import useMergeRefs from 'react-native/Libraries/Utilities/useMergeRefs';

import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { useSyncRef } from '~/framework/hooks/ref';

/**
 * Below here are custom constants specific to communities navbar & banner.
 */

export const BANNER_ACCELERATION = 5 / 3;

enum CHILD_INDEX {
  NAVBAR = 0,
  BANNER = 1,
}

/**
 * Below here a (badly written) Typescript adaptation of the original module.
 */

export type ScrollViewStickyHeaderProps = Readonly<{
  children?: React.ReactNode;
  // nextHeaderLayoutY: number | null;
  onLayout: (event: LayoutChangeEvent) => void;
  scrollAnimatedValue: Animated.Value;
  // Will cause sticky headers to stick at the bottom of the ScrollView instead
  // of the top.
  inverted: boolean | null;
  // The height of the parent ScrollView. Currently only set when inverted.
  scrollViewHeight: number | null;
  nativeID?: string;
  hiddenOnScroll?: boolean | null;
  index: number;
}>;

type Instance = typeof Animated.View & {
  // setNextHeaderY: (value: number) => void;
};

function ScrollViewStickyHeader({
  ref: _ref,
  ...props
}: ScrollViewStickyHeaderProps & {
  ref?: React.Ref<Instance>;
}) {
  const internalRef = React.useRef<Instance>(null);
  const ref = useSyncRef(_ref, internalRef);
  const { index, inverted, scrollAnimatedValue, scrollViewHeight } = props;

  const [measured, setMeasured] = useState<boolean>(false);
  const [layoutY, setLayoutY] = useState<number>(0);
  const [layoutHeight, setLayoutHeight] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number | null>(null);
  // const [nextHeaderLayoutY, setNextHeaderLayoutY] = useState<number | null>(_nextHeaderLayoutY);
  // const [isFabric, setIsFabric] = useState<boolean>(false);

  const [animatedTranslateY, setAnimatedTranslateY] = useState<Animated.AnimatedNode>(() => {
    const inputRange: Array<number> = [-1, 0];
    const outputRange: Array<number> = [0, 0];
    const initialTranslateY = scrollAnimatedValue.interpolate({
      inputRange,
      outputRange,
    });

    return initialTranslateY;
  });

  // Edifice : we animate opacity in addition to Y position.
  const [animatedOpacity, setAnimatedOpacity] = useState(() => {
    const inputRange: Array<number> = [-1, 0];
    const outputRange: Array<number> = [1, 1];
    const initialOpacity = scrollAnimatedValue.interpolate({
      inputRange,
      outputRange,
    });
    return initialOpacity;
  });

  const haveReceivedInitialZeroTranslateY = useRef<boolean>(true);
  const translateYDebounceTimer = useRef<TimeoutID | null>(null);

  useEffect(() => {
    if (translateY !== 0 && translateY != null) {
      haveReceivedInitialZeroTranslateY.current = false;
    }
  }, [translateY]);

  // This is called whenever the (Interpolated) Animated Value
  // updates, which is several times per frame during scrolling.
  // To ensure that the Fabric ShadowTree has the most recent
  // translate style of this node, we debounce the value and then
  // pass it through to the underlying node during render.
  // This is:
  // 1. Only an issue in Fabric.
  // 2. Worse in Android than iOS. In Android, but not iOS, you
  //    can touch and move your finger slightly and still trigger
  //    a "tap" event. In iOS, moving will cancel the tap in
  //    both Fabric and non-Fabric. On Android when you move
  //    your finger, the hit-detection moves from the Android
  //    platform to JS, so we need the ShadowTree to have knowledge
  //    of the current position.
  const animatedValueListener = useCallback(({ value }) => {
    const debounceTimeout: number = Platform.OS === 'android' ? 15 : 64;
    // When the AnimatedInterpolation is recreated, it always initializes
    // to a value of zero and emits a value change of 0 to its listeners.
    if (value === 0 && !haveReceivedInitialZeroTranslateY.current) {
      haveReceivedInitialZeroTranslateY.current = true;
      return;
    }
    if (translateYDebounceTimer.current != null) {
      clearTimeout(translateYDebounceTimer.current);
    }
    translateYDebounceTimer.current = setTimeout(() => setTranslateY(value), debounceTimeout);
  }, []);

  useEffect(() => {
    const inputRange: Array<number> = [-1, 0];
    const outputRange: Array<number> = [0, 0]; // Edifice: this value replace the original [0, 0]

    // if (measured) {
    //   if (inverted === true) {
    //     // The interpolation looks like:
    //     // - Negative scroll: no translation
    //     // - `stickStartPoint` is the point at which the header will start sticking.
    //     //   It is calculated using the ScrollView viewport height so it is a the bottom.
    //     // - Headers that are in the initial viewport will never stick, `stickStartPoint`
    //     //   will be negative.
    //     // - From 0 to `stickStartPoint` no translation. This will cause the header
    //     //   to scroll normally until it reaches the top of the scroll view.
    //     // - From `stickStartPoint` to when the next header y hits the bottom edge of the header: translate
    //     //   equally to scroll. This will cause the header to stay at the top of the scroll view.
    //     // - Past the collision with the next header y: no more translation. This will cause the
    //     //   header to continue scrolling up and make room for the next sticky header.
    //     //   In the case that there is no next header just translate equally to
    //     //   scroll indefinitely.
    //     if (scrollViewHeight != null) {
    //       const stickStartPoint = layoutY + layoutHeight - scrollViewHeight;
    //       if (stickStartPoint > 0) {
    //         inputRange.push(stickStartPoint);
    //         outputRange.push(0);
    //         inputRange.push(stickStartPoint + 1);
    //         outputRange.push(1);
    //         // If the next sticky header has not loaded yet (probably windowing) or is the last
    //         // we can just keep it sticked forever.
    //         const collisionPoint = (nextHeaderLayoutY || 0) - layoutHeight - scrollViewHeight;
    //         if (collisionPoint > stickStartPoint) {
    //           inputRange.push(collisionPoint, collisionPoint + 1);
    //           outputRange.push(collisionPoint - stickStartPoint, collisionPoint - stickStartPoint);
    //         }
    //       }
    //     }
    //   } else {
    //     // The interpolation looks like:
    //     // - Negative scroll: no translation
    //     // - From 0 to the y of the header: no translation. This will cause the header
    //     //   to scroll normally until it reaches the top of the scroll view.
    //     // - From header y to when the next header y hits the bottom edge of the header: translate
    //     //   equally to scroll. This will cause the header to stay at the top of the scroll view.
    //     // - Past the collision with the next header y: no more translation. This will cause the
    //     //   header to continue scrolling up and make room for the next sticky header.
    //     //   In the case that there is no next header just translate equally to
    //     //   scroll indefinitely.
    //     inputRange.push(layoutY);
    //     outputRange.push(0);
    //     // If the next sticky header has not loaded yet (probably windowing) or is the last
    //     // we can just keep it sticked forever.
    //     const collisionPoint = (nextHeaderLayoutY || 0) - layoutHeight;
    //     if (collisionPoint >= layoutY) {
    //       inputRange.push(collisionPoint, collisionPoint + 1);
    //       outputRange.push(collisionPoint - layoutY, collisionPoint - layoutY);
    //     } else {
    //       inputRange.push(layoutY + 1);
    //       outputRange.push(1);
    //     }
    //   }
    // }
    //

    // Y Position range
    if (measured) {
      if (index === CHILD_INDEX.BANNER) {
        inputRange.push(layoutHeight);
        outputRange.push(-BANNER_ACCELERATION * layoutHeight);
      } else /* index === CHILD_INDEX.NAVBAR */ {
        inputRange.push(layoutHeight);
        outputRange.push(0);
        inputRange.push(layoutHeight + 1);
        outputRange.push(1);
      }
    }

    let newAnimatedTranslateY: Animated.AnimatedNode = scrollAnimatedValue.interpolate({
      extrapolateLeft: 'clamp',
      inputRange,
      outputRange,
    });

    // Opacity range
    const opacityInputRange = [
      -1,
      UI_SIZES.screen.topInset + UI_SIZES.elements.navbarHeight + TextSizeStyle.Medium.fontSize,
      UI_SIZES.screen.topInset + UI_SIZES.elements.navbarHeight + TextSizeStyle.Medium.lineHeight,
    ];
    const opacityOutputRange = index === CHILD_INDEX.BANNER ? [1, 1, 0] : [0, 0, 1];

    let newOpacityValue = scrollAnimatedValue.interpolate({
      extrapolate: 'clamp',
      inputRange: opacityInputRange,
      outputRange: opacityOutputRange,
    });

    // add the event listener
    let animatedListenerId;
    // if (isFabric) {
    //   animatedListenerId = newAnimatedTranslateY.addListener(animatedValueListener);
    // }

    setAnimatedTranslateY(newAnimatedTranslateY);
    setAnimatedOpacity(newOpacityValue);

    // clean up the event listener and timer
    return () => {
      if (animatedListenerId) {
        newAnimatedTranslateY.removeListener(animatedListenerId);
      }
      if (translateYDebounceTimer.current != null) {
        clearTimeout(translateYDebounceTimer.current);
      }
    };
  }, [measured, layoutHeight, layoutY, scrollViewHeight, scrollAnimatedValue, inverted, animatedValueListener, index]);

  React.useLayoutEffect(() => {
    const { height, y } = internalRef.current?.getBoundingClientRect();
    setLayoutY(y);
    setLayoutHeight(height);
    setMeasured(true);
  }, [ref]);

  // const _onLayout = (event: LayoutChangeEvent) => {
  //   setLayoutY(event.nativeEvent.layout.y);
  //   setLayoutHeight(event.nativeEvent.layout.height);
  //   setMeasured(true);

  //   props.onLayout(event);
  //   const child = React.Children.only<$FlowFixMe>(props.children);
  //   if (child.props.onLayout) {
  //     child.props.onLayout(event);
  //   }
  // };

  const child = React.Children.only<$FlowFixMe>(props.children);

  // const passthroughAnimatedPropExplicitValues =
  //   isFabric && translateY != null
  //     ? {
  //         style: { transform: [{ translateY }] },
  //       }
  //     : null;

  return (
    <Animated.View
      collapsable={false}
      nativeID={props.nativeID}
      // onLayout={_onLayout}
      /* $FlowFixMe[prop-missing] passthroughAnimatedPropExplicitValues isn't properly
         included in the Animated.View flow type. */
      ref={ref}
      style={[child.props.style, styles.header, { opacity: animatedOpacity, transform: [{ translateY: animatedTranslateY }] }]}
      // passthroughAnimatedPropExplicitValues={passthroughAnimatedPropExplicitValues}
    >
      {cloneElement(child, {
        onLayout: undefined, // we call this manually through our this._onLayout
        style: styles.fill, // We transfer the child style to the wrapper.
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    zIndex: 10,
  },
});

export default ScrollViewStickyHeader;
