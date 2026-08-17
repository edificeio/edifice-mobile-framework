import * as React from 'react';

import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { ParamListBase, useNavigation } from '@react-navigation/native';

/**
 * Keeps the tabs still while a finger is on a carousel.
 *
 * Both answer to the same horizontal drag, and the pager of the navigator is native: on Android it
 * claims the gesture, and the user changes tab instead of scrolling the row. Its swipe is therefore
 * turned off as soon as the row is touched, and back on when the finger leaves.
 *
 * The touch is what matters, not the scroll: a scroll event only fires once the row already won the
 * gesture, which is exactly the case that needs no fixing.
 *
 * Returns handlers meant to be spread on a carousel living inside a tab screen.
 */
export function useTabSwipeLock() {
  const navigation = useNavigation<MaterialTopTabNavigationProp<ParamListBase>>();
  const enabled = React.useRef(true);

  const setSwipeEnabled = React.useCallback(
    (swipeEnabled: boolean) => {
      // every call re-renders the navigator, so only a real change is applied.
      if (enabled.current === swipeEnabled) return;
      enabled.current = swipeEnabled;
      navigation.setOptions({ swipeEnabled });
    },
    [navigation],
  );

  return React.useMemo(
    () => ({
      // The finger can leave during the fling, which ends after the touch does.
      onMomentumScrollEnd: () => setSwipeEnabled(true),
      onTouchCancel: () => setSwipeEnabled(true),
      onTouchEnd: () => setSwipeEnabled(true),
      onTouchStart: () => setSwipeEnabled(false),
    }),
    [setSwipeEnabled],
  );
}
