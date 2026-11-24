import { FlatList } from 'react-native';

import { FlatListPropsWithLayout, isSharedValue, SharedValue } from 'react-native-reanimated';

/**
 * A shared value that is only read. Reanimated 4 types the animated props with it (`SharedValueDisableContravariance`, not
 * exported): a `SharedValue` without `set` and `modify`, so that a value of a narrower type is accepted. A `SharedValue` is one too.
 */
type ReadonlySharedValue<T> = Omit<SharedValue<T>, 'set' | 'modify'>;

// Reanimated types many non-style component props as `T | SharedValue<T>` (see `AnimatedProps`), letting callers
// pass either a plain value or one wrapped for UI-thread updates. `'worklet'` lets this run from both a worklet
// (UI thread) and plain JS, since callers need to resolve the value in either context.
export function unwrapAnimatedProp<T>(value: T | ReadonlySharedValue<T> | null | undefined): T | null | undefined {
  'worklet';
  // `isSharedValue` narrows to a `SharedValue`, not to its read-only form: the other branch is told it is the plain value
  return isSharedValue<T>(value) ? value.value : (value as T | null | undefined);
}

export type AnimatedFlatListProps<T> = FlatListPropsWithLayout<T> & {
  ref?: React.Ref<FlatList<T> | null>;
};
