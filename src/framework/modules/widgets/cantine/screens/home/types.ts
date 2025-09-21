import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CantineNavigationParams } from '~/framework/modules/widgets/cantine/navigation';

export interface CantineHomeScreenProps {
  // @scaffolder add props here
}

export interface CantineHomeScreenNavParams {
  // requiredFoo: string; // @scaffolder remove example
  // optionalBar?: number; // @scaffolder remove example
  // @scaffolder add nav params here
}

export interface CantineHomeScreenPrivateProps
  extends NativeStackScreenProps<CantineNavigationParams, 'home'>,
    CantineHomeScreenProps {
  // @scaffolder add HOC props here
}
