import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CarouselParams } from '~/framework/components/carousel/screen';

export type NavigationRootParams = {
  tabs: undefined;
  carousel: CarouselParams;
};

export type NavigationTabParams = {
  timeline: undefined;
  mails: undefined;
  community: undefined;
  myapps: undefined;
};

export type NavigationRootScreenProps<T extends keyof NavigationRootParams> = NativeStackScreenProps<NavigationRootParams, T>;
export type NavigationTabScreenProps<T extends keyof NavigationTabParams> = CompositeScreenProps<
  BottomTabScreenProps<NavigationTabParams, T>,
  NavigationRootScreenProps<'tabs'>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends NavigationRootParams {}
  }
}
