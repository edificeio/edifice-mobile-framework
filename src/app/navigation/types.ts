import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type authModule from '~/framework/modules/auth';
import type mediaModule from '~/framework/modules/media';
import { KeysOfUnion, ValueFromUnion } from '~/utils/types';

import { ModuleNavigationParams, OneModule } from '../module/types';

import type { TABS_ROUTE_NAME } from '.';

export type NavigationRootParams = {
  [TABS_ROUTE_NAME]: undefined;
} & ModuleNavigationParams<typeof authModule> &
  ModuleNavigationParams<typeof mediaModule>;

// ToDo : ^^^ find a way to have a typed set of root modules here instead of list it manually

export type NavigationTabParams = {
  timeline: undefined;
  mails: undefined;
  community: undefined;
  myapps: undefined;
};

// ToDo : ^^^ really need to staticly type this ?

type AllModulesNavigationParamsAsUnion = ModuleNavigationParams<OneModule>;
export type AllModulesScreenNames = KeysOfUnion<AllModulesNavigationParamsAsUnion>;
export type AllModulesNavigationParams = {
  [RouteName in AllModulesScreenNames]: ValueFromUnion<AllModulesNavigationParamsAsUnion, RouteName>;
};

export type NavigationRootScreenProps<T extends keyof NavigationRootParams> = NativeStackScreenProps<NavigationRootParams, T>;
export type NavigationTabScreenProps<T extends keyof NavigationTabParams> = CompositeScreenProps<
  BottomTabScreenProps<NavigationTabParams, T>,
  NavigationRootScreenProps<typeof TABS_ROUTE_NAME>
>;

export type ModuleScreenProps<T extends keyof AllModulesNavigationParams> = NativeStackScreenProps<AllModulesNavigationParams, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends NavigationRootParams {}
  }
}
