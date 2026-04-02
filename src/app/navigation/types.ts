import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackNavigatorProps, NativeStackOptionsArgs, NativeStackScreenProps } from '@react-navigation/native-stack';

import { AllModulesAsTuple, ModuleNavigationParams } from '../module/types';

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

type AllModulesNavigationParamsTuple = {
  [I in keyof AllModulesAsTuple]: ModuleNavigationParams<AllModulesAsTuple[I]>;
};

export type AllModulesNavigationParams = AllModulesNavigationParamsTuple[keyof AllModulesNavigationParamsTuple];

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

export type ScreenOptions<T extends keyof AllModulesNavigationParams = keyof AllModulesNavigationParams> = (
  props: NativeStackOptionsArgs<AllModulesNavigationParams, T>,
) => Exclude<NativeStackNavigatorProps['screenOptions'], Function>;
