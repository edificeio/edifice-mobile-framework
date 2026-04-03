import { NativeStackNavigatorProps, NativeStackOptionsArgs } from '@react-navigation/native-stack';

import { AllModulesNavigationParams } from './types';

export type ScreenOptions<T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams> = (
  props: NativeStackOptionsArgs<AllModulesNavigationParams, T>,
) => Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined>;

export function screenOptions<T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams>(
  options: ScreenOptions<T>,
): Exclude<NativeStackNavigatorProps['screenOptions'], Function | undefined> {
  return options;
}
