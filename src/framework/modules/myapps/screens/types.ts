import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IMyAppsNavigationParams, myAppsRouteNames } from '~/framework/modules/myapps/navigation';
import { NavigableModuleArray } from '~/framework/util/moduleTool';

export interface MyAppsHomeScreenProps extends NativeStackScreenProps<IMyAppsNavigationParams, typeof myAppsRouteNames.Home> {
  modules: NavigableModuleArray;
  secondaryModules: NavigableModuleArray;
  connectors: NavigableModuleArray;
}

export type MyAppsEmptyScreenConfig = Record<'favorites' | 'search' | 'other', { title: string; text: string }>;

export type BottomSheetMode = 'home_menu' | 'app_actions';
