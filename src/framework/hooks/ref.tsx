import * as React from 'react';

import type { AnimatedRef } from 'react-native-reanimated';

// A ref parameterized like `AnimatedRef<X>` is already structurally a valid `React.Ref<X>` (it's a callable
// with extra properties), so it doesn't need to be listed here. The bare, non-generic `AnimatedRef` does need
// to be: it's the fallback branch reanimated's own `AnimatedComponentRef<T>` always includes (regardless of T)
// for refs it can't tie to a specific instance type, and since a union argument is only assignable if every
// branch is, any ref coming from a `ComponentProps<Animated.XXX<T>>`-derived prop needs this branch accepted too.
type SyncableRef<T> = React.Ref<T> | AnimatedRef | undefined;

export const useSyncRef = <T extends any>(...refs: SyncableRef<T>[]) => {
  return React.useCallback(
    (node: T) => {
      refs.forEach(ref => {
        if (ref) {
          if (typeof ref === 'function') {
            // Calling through a union of call signatures (`RefCallback<T>` and the bare `AnimatedRef`'s) would
            // require `node` to satisfy all of them at once, which a generic `T` can't prove — cast to call it
            // uniformly; both shapes are meant to be invoked with the rendered instance either way.
            (ref as (node: T) => void)(node);
          } else {
            (ref as React.RefObject<T>).current = node;
          }
        }
      });
    },
    [refs],
  );
};
