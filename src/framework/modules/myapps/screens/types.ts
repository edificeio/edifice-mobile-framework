import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IMyAppsNavigationParams, myAppsRouteNames } from '~/framework/modules/myapps/navigation';

export interface MyAppsHomeScreenProps extends NativeStackScreenProps<IMyAppsNavigationParams, typeof myAppsRouteNames.Home> {}

export type MyAppsEmptyScreenConfig = Record<'favorites' | 'search' | 'other', { title: string; text: string; testID?: string }>;

export type BottomSheetMode = 'home_menu' | 'app_actions';
