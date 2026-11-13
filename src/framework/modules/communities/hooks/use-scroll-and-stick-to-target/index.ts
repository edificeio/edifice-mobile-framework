import * as React from 'react';

import { ScrollTarget, UseScrollAndStickToTarget, UseScrollAndStickToTargetParams } from './types';

/** The list stays on its target until its content doesn't change for this duration (ms). */
const STICK_SETTLE_DELAY = 1500;

/**
 * Scrolls the list to a target (its end, or an item index), then keeps it there.
 *
 * When going to an item, the heights of the list change while it settles: the pages around replace their placeholders,
 * and the WebViews measure their content. A single scroll would end up at the wrong position, so the list is kept on its
 * target until its content stops changing, or the user scrolls.
 */
export function useScrollAndStickToTarget<T>({
  listRef,
  viewOffset = 0,
}: UseScrollAndStickToTargetParams<T>): UseScrollAndStickToTarget {
  // Stored in a ref so that `scrollAndStickTo` keeps the same reference when the offset changes
  const viewOffsetRef = React.useRef(viewOffset);
  viewOffsetRef.current = viewOffset;

  const targetRef = React.useRef<ScrollTarget>(undefined);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const stopSticking = React.useCallback(() => {
    targetRef.current = undefined;
    clearTimeout(timeoutRef.current);
  }, []);

  const scrollAndStickTo = React.useCallback(
    (target: ScrollTarget) => {
      targetRef.current = target;
      if (target === 'end') listRef.current?.scrollToEnd({ animated: false });
      // Unlike FlatList, FlashList adds `viewOffset` to the item position
      else listRef.current?.scrollToIndex({ animated: false, index: target, viewOffset: viewOffsetRef.current });
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(stopSticking, STICK_SETTLE_DELAY);
    },
    [listRef, stopSticking],
  );

  const onContentSizeChange = React.useCallback(() => {
    if (targetRef.current !== undefined) scrollAndStickTo(targetRef.current);
  }, [scrollAndStickTo]);

  React.useEffect(() => stopSticking, [stopSticking]);

  return { onContentSizeChange, scrollAndStickTo, stopSticking };
}

export type { ScrollTarget } from './types';
