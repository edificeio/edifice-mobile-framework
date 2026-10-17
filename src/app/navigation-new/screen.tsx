import { SharedTransition } from 'react-native-reanimated';

import { modalOptions } from './options';
import type { ScreenComponent, ScreenConfig, ScreenOptionsProps } from './types';

/**
 * Config of a screen like `createNativeStackScreen` takes it, except that `options` can only be a function.
 * Options are often made of values that are not available when the module is imported (i18n wordings, theme...): such a value
 * evaluated at import time can be `undefined`, depending on the order the modules are imported. A function is evaluated when the
 * screen renders. It is required even when not needed, so nobody has to wonder.
 */
export type StrictScreenConfig<Component extends ScreenComponent> = Omit<ScreenConfig<Component>, 'options'> & {
  options?: Extract<ScreenConfig<Component>['options'], Function>;
};

/**
 * Typing helper to declare a screen (or modal) config in the screen's own file.
 * It does nothing at runtime : the returned config is the one given in parameter.
 *
 * Same typing as `createNativeStackScreen`: the navigation params are inferred from the props of the `screen` component,
 * so `options`, `listeners`, `getId`... are aware of them. The module takes care of calling `createNativeStackScreen` itself.
 * `options` must be a function (see `StrictScreenConfig`).
 */
export const defineScreen = <Component extends ScreenComponent>(config: StrictScreenConfig<Component>) =>
  config as ScreenConfig<Component>;

export const sharedTransitions = {
  default: SharedTransition.duration(500).springify(),
};

/**
 * Same as `defineScreen`, for a modal screen : modal default options are applied under the ones declared by the screen.
 */
export const defineModal = <Component extends ScreenComponent>(config: StrictScreenConfig<Component>) => {
  const { options } = config;
  return {
    ...config,
    options: (props: ScreenOptionsProps) => ({
      ...modalOptions(props),
      ...options?.(props as never),
    }),
  } as ScreenConfig<Component>;
};
