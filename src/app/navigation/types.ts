import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { KeysOfUnion, ValueFromUnion } from '~/util/types';

import type { TABS_ROUTE_NAME } from '.';

/**
 * @deprecated
 */
export type NavigationRootParams = any;

// ToDo : ^^^ find a way to have a typed set of root modules here instead of list it manually

/**
 * @deprecated
 */
export type NavigationTabParams = {
  timeline: undefined;
  mails: undefined;
  community: undefined;
  myapps: undefined;
};

// ToDo : ^^^ really need to staticly type this ?

/**
 * @deprecated
 */
type AllModulesNavigationParamsAsUnion = any;
/**
 * @deprecated
 */
export type AllModulesScreenNames = KeysOfUnion<AllModulesNavigationParamsAsUnion>;
/**
 * @deprecated
 */
export type AllModulesNavigationParams = {
  [RouteName in AllModulesScreenNames]: ValueFromUnion<AllModulesNavigationParamsAsUnion, RouteName>;
};

/**
 * @deprecated
 */
export type NavigationRootScreenProps<T extends keyof NavigationRootParams> = NativeStackScreenProps<NavigationRootParams, T>;
/**
 * @deprecated
 */
export type NavigationTabScreenProps<T extends keyof NavigationTabParams> = CompositeScreenProps<
  BottomTabScreenProps<NavigationTabParams, T>,
  NavigationRootScreenProps<typeof TABS_ROUTE_NAME>
>;

/**
 * @deprecated
 */
export type ModuleScreenProps<T extends keyof AllModulesNavigationParams> = NativeStackScreenProps<AllModulesNavigationParams, T>;
