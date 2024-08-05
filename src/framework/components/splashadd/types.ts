import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

export interface SplashaddScreenDataProps {}

export interface SplashaddScreenEventProps {}

export interface SplashaddScreenNavParams {
  resourceUri: string;
}

export type SplashaddScreenProps = SplashaddScreenDataProps &
  SplashaddScreenEventProps &
  NativeStackScreenProps<IModalsNavigationParams, typeof ModalsRouteNames.SplashAdd>;
