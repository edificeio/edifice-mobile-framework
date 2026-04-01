import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ModuleNavigationParams } from '../module/types';

import type modules from '~/app/config/modules';
import type { CarouselParams } from '~/framework/components/carousel/screen';

export type NavigationRootModalsParams = {
  carousel: CarouselParams;
};

export type NavigationRootParams = NavigationRootModalsParams & {
  tabs: undefined;
  guest: undefined;
};

export type NavigationTabParams = {
  timeline: undefined;
  mails: undefined;
  community: undefined;
  myapps: undefined;
};

type ResolvedModule<T> = T extends Promise<infer M> ? M : never;

type AllModulesTuple = {
  [I in keyof typeof modules as I extends `${number}` ? I : never]: ResolvedModule<(typeof modules)[I]>['default'];
};

type AllModulesNavigationParamsTuple = {
  [I in keyof AllModulesTuple]: ModuleNavigationParams<AllModulesTuple[I]>;
};

type AllModulesNavigationParams = AllModulesNavigationParamsTuple[keyof AllModulesNavigationParamsTuple];

export type NavigationRootScreenProps<T extends keyof NavigationRootParams> = NativeStackScreenProps<NavigationRootParams, T>;
export type NavigationTabScreenProps<T extends keyof NavigationTabParams> = CompositeScreenProps<
  BottomTabScreenProps<NavigationTabParams, T>,
  NavigationRootScreenProps<'tabs'>
>;

export type ModuleScreenProps<T extends keyof AllModulesNavigationParams> = NativeStackScreenProps<AllModulesNavigationParams, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends NavigationRootParams {}
  }
}
