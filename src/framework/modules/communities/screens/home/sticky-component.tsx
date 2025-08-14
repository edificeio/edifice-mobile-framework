/**
 * Sticky Component override for community home screen.
 * That component apply the right scroll-based animation knowing the index of the child element.
 *
 * The implementation of this component is based on the code of the default StickyHeaderComponent passed to ScrollView in react-native.
 */

import * as React from 'react';
import { cloneElement, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Platform, StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import { useSyncRef } from '~/framework/hooks/ref';

export type ScrollViewStickyHeaderProps = Readonly<{
  children?: React.ReactNode;
  nextHeaderLayoutY?: number;
  onLayout: (event: LayoutChangeEvent) => void;
  scrollAnimatedValue: Animated.Value;
  nativeID?: string;
  index: number;
}>;

enum CHILD_INDEX {
  NAVBAR = 0,
  BANNER = 1,
}

type Instance = React.Ref<typeof Animated.View> & {
  setNextHeaderY: (value: number) => void;
};

export const BANNER_ACCELERATION = 5 / 3;

const CommunityScrollViewStickyHeader = function ScrollViewStickyHeader({
  ref: forwardedRef,
  ...props
}: {
  ref?: React.Ref<Instance>;
} & ScrollViewStickyHeaderProps) {
  const { index, nextHeaderLayoutY: _nextHeaderLayoutY, scrollAnimatedValue } = props;

  const [measured, setMeasured] = useState<boolean>(false);
  const [layoutY, setLayoutY] = useState<number>(0);
  const [layoutHeight, setLayoutHeight] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number | null>(null);
  const [nextHeaderLayoutY, setNextHeaderLayoutY] = useState<number | undefined>(_nextHeaderLayoutY);

  const callbackRef = useCallback((ref: Instance | null): void => {
    if (ref == null) {
      return;
    }
    ref.setNextHeaderY = setNextHeaderLayoutY;
  }, []);
  const ref: React.Ref<React.ElementRef<typeof Animated.View>> = useSyncRef<Instance>(callbackRef, forwardedRef!);

  const [animatedTranslateY, setAnimatedTranslateY] = useState(() => {
    const inputRange: Array<number> = [-1, 0];
    const outputRange: Array<number> = [0, 0];
    const initialTranslateY = scrollAnimatedValue.interpolate({
      inputRange,
      outputRange,
    });
    return initialTranslateY;
  });

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
  const translateYDebounceTimer = useRef<NodeJS.Timeout>();

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
    // Position range
    const inputRange: Array<number> = [-1, 0];
    const outputRange: Array<number> = [-1, 0];
    if (measured) {
      if (index === CHILD_INDEX.BANNER) {
        // banner
        inputRange.push(layoutY);
        outputRange.push(-1);
        inputRange.push(layoutY + 1);
        outputRange.push(-BANNER_ACCELERATION);
      } else {
        // navbar
        inputRange.push(layoutY);
        outputRange.push(0);
        inputRange.push(layoutY + 1);
        outputRange.push(1);
      }
    }

    let newAnimatedTranslateY = scrollAnimatedValue.interpolate({
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
      inputRange: opacityInputRange,
      outputRange: opacityOutputRange,
    });

    // add the event listener
    let animatedListenerId;
    // Remove next line if is not fabric
    animatedListenerId = newAnimatedTranslateY.addListener(animatedValueListener);

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
  }, [nextHeaderLayoutY, measured, layoutHeight, layoutY, scrollAnimatedValue, animatedValueListener, index]);

  const _onLayout = (event: LayoutChangeEvent) => {
    setLayoutY(event.nativeEvent.layout.y);
    setLayoutHeight(event.nativeEvent.layout.height);
    setMeasured(true);

    props.onLayout(event);
    const child = React.Children.only(props.children);
    if (React.isValidElement(child) && child.props.onLayout) {
      child.props.onLayout(event);
    }
  };

  const child = React.Children.only(props.children);

  return (
    <Animated.View
      collapsable={false}
      nativeID={props.nativeID}
      onLayout={_onLayout}
      /* $FlowFixMe[prop-missing] passthroughAnimatedPropExplicitValues isn't properly
         included in the Animated.View flow type. */
      ref={ref}
      style={[
        React.isValidElement(child) ? child.props.style : undefined,
        styles.header,
        { opacity: animatedOpacity, transform: [{ translateY: animatedTranslateY }] },
      ]}>
      {React.isValidElement(child) &&
        cloneElement(child, {
          // We transfer the child style to the wrapper.
          onLayout: undefined,
          style: styles.fill, // we call this manually through our this._onLayout
        })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    zIndex: 10,
  },
});

export default CommunityScrollViewStickyHeader;
