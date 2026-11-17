import * as React from 'react';

import { Temporal } from '@js-temporal/polyfill';
import { Gesture } from 'react-native-gesture-handler';
import { Easing, SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { UI_SIZES } from '~/framework/components/constants';

export enum SwipeDirection {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

const SWIPE_THRESHOLD = 50;
const SWIPE_ANIMATION_DURATION = 200;
// keep the exit animation duration between these bounds.
const SWIPE_EXIT_MIN_DURATION = 80;
const SWIPE_EXIT_MAX_DURATION = 200;
const SWIPE_ENTER_EASING = Easing.out(Easing.cubic);

const SATURDAY = 6;
const MONDAY = 1;

// skip Sunday because not available in the picker.
const shiftDay = (day: Temporal.PlainDate, direction: SwipeDirection) => {
  const step =
    (direction === SwipeDirection.LEFT && day.dayOfWeek === SATURDAY) ||
    (direction === SwipeDirection.RIGHT && day.dayOfWeek === MONDAY)
      ? 2
      : 1;
  return direction === SwipeDirection.LEFT ? day.add({ days: step }) : day.subtract({ days: step });
};

/**
 * swipe the menu left or right to change the day, Sunday skipped.
 * touches above menuTop (the pickers) are left to the list.
 */
export function useDaySwipe(
  selectedDate: Temporal.PlainDate,
  onDayChange: (date: Temporal.PlainDate) => void,
  menuTop: SharedValue<number>,
) {
  const translateX = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  // start entering animation after the selected day has rendered.
  const enteringSide = React.useRef<number>(0);
  // prevent another swipe while the day is changing.
  const isChangingDay = useSharedValue(false);

  React.useEffect(() => {
    if (!enteringSide.current) return;
    translateX.value = enteringSide.current * UI_SIZES.screen.width;
    translateX.value = withTiming(0, { duration: SWIPE_ANIMATION_DURATION, easing: SWIPE_ENTER_EASING }, () => {
      isChangingDay.value = false;
    });
    enteringSide.current = 0;
  }, [isChangingDay, selectedDate, translateX]);

  const changeDay = (direction: SwipeDirection) => {
    enteringSide.current = direction === SwipeDirection.LEFT ? 1 : -1;
    onDayChange(shiftDay(selectedDate, direction));
  };

  const gesture = Gesture.Pan()
    // only the menu swipes, not the pickers above it.
    .onTouchesDown((event, manager) => {
      if (event.allTouches[0].y < menuTop.value) manager.fail();
    })
    .activeOffsetX([-10, 10])
    // let vertical gestures pass through to the scrollView.
    .failOffsetY([-10, 10])
    .onUpdate(event => {
      if (isChangingDay.value) return;
      translateX.value = event.translationX;
    })
    .onEnd((event, success) => {
      if (isChangingDay.value) return;
      if (!success || Math.abs(event.translationX) <= SWIPE_THRESHOLD) {
        translateX.value = withTiming(0, { duration: SWIPE_ANIMATION_DURATION });
        return;
      }
      const direction = event.translationX < 0 ? SwipeDirection.LEFT : SwipeDirection.RIGHT;
      const exitOffset = Math.sign(event.translationX) * UI_SIZES.screen.width;
      const remainingDistance = Math.abs(exitOffset - event.translationX);
      const fingerDuration = (remainingDistance / Math.max(Math.abs(event.velocityX), 1)) * 1000;
      const exitDuration = Math.min(Math.max(fingerDuration, SWIPE_EXIT_MIN_DURATION), SWIPE_EXIT_MAX_DURATION);
      isChangingDay.value = true;
      translateX.value = withTiming(exitOffset, { duration: exitDuration, easing: Easing.linear }, finished => {
        if (finished) scheduleOnRN(changeDay, direction);
        else isChangingDay.value = false;
      });
    });

  return { gesture, style };
}
