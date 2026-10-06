import type { createNativeStackScreen } from '@react-navigation/native-stack';
import { SharedTransition } from 'react-native-reanimated';

import type { ScreenComponent } from './types';

/**
 * Typing helper to declare a screen (or modal) config in the screen's own file.
 * It does nothing at runtime : the returned config is the one given in parameter.
 *
 * Same typing as `createNativeStackScreen`: the navigation params are inferred from the props of the `screen` component,
 * so `options`, `listeners`, `getId`... are aware of them. The module takes care of calling `createNativeStackScreen` itself.
 */
export const defineScreen = <Component extends ScreenComponent>(config: Parameters<typeof createNativeStackScreen<Component>>[0]) =>
  config;

export const sharedTransitions = {
  default: SharedTransition.duration(500).springify(),
};
