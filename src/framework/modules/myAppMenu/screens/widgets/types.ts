import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MyAppMenuNavigationParams } from '~/framework/modules/myAppMenu/navigation';

export interface MyAppMenuWidgetsScreenProps {
  // @scaffolder add props here
}

export interface MyAppMenuWidgetsScreenNavParams {
  // @scaffolder add nav params here
}

export interface MyAppMenuWidgetsScreenPrivateProps
  extends NativeStackScreenProps<MyAppMenuNavigationParams, 'widgets'>,
    MyAppMenuWidgetsScreenProps {
  // @scaffolder add HOC props here
}
