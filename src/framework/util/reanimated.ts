import { isSharedValue, SharedValue } from 'react-native-reanimated';

// Reanimated types many non-style component props as `T | SharedValue<T>` (see `AnimatedProps`), letting callers
// pass either a plain value or one wrapped for UI-thread updates. `'worklet'` lets this run from both a worklet
// (UI thread) and plain JS, since callers need to resolve the value in either context.
export function unwrapAnimatedProp<T>(value: T | SharedValue<T> | null | undefined): T | null | undefined {
  'worklet';
  return isSharedValue<T>(value) ? value.value : value;
}
