import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ScreenTimeNavigationParams } from '~/framework/modules/widgets/screen-time/navigation';

export interface ScreenTimeHomeScreenProps {
  // @scaffolder add props here
}

export interface ScreenTimeHomeScreenNavParams {
  // requiredFoo: string; // @scaffolder remove example
  // optionalBar?: number; // @scaffolder remove example
  // @scaffolder add nav params here
}

export interface ScreenTimeHomeScreenPrivateProps
  extends NativeStackScreenProps<ScreenTimeNavigationParams, 'home'>,
    ScreenTimeHomeScreenProps {
  // @scaffolder add HOC props here
}
