import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IMyAppsNavigationParams } from '~/framework/modules/myAppMenu/navigation';
import { NavigableModuleArray } from '~/framework/util/moduleTool';

export interface MyAppMenuWidgetsScreenProps {
  // @scaffolder add props here
}

export interface MyAppMenuWidgetsScreenNavParams {
  // @scaffolder add nav params here
}

export interface MyAppMenuWidgetsScreenPrivateProps
  extends NativeStackScreenProps<IMyAppsNavigationParams, 'widgets'>,
    MyAppMenuWidgetsScreenProps {
  widgetsList: NavigableModuleArray;
}
