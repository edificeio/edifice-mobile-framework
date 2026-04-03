import { NativeStackNavigatorProps, NativeStackOptionsArgs } from '@react-navigation/native-stack';

import { AllModulesNavigationParams } from './types';

export type ScreenOptions<T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams> = (
  props: NativeStackOptionsArgs<AllModulesNavigationParams, T>,
) => Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;

/**
 * Use this function to declare your screen options.
 *
 * Examples:
 * ```typescript
 * // Provides type hints and autocompletion
 * screenOptions(() => ({ title: I18n.get('screen-title') }));
 *
 * // Give the screen name to have options props automatically typed !
 * screenOptions<'module/screen'>(({route}) => ({ title: route.params.name }));
 * ```
 * @param options
 * @returns
 */
export function screenOptions<T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams>(
  options: ScreenOptions<T>,
) {
  return options as Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;
}
