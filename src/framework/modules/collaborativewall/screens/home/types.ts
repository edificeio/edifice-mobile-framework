import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CollaborativewallNavigationParams } from '~/framework/modules/collaborativewall/navigation';

export interface CollaborativewallHomeScreenProps {
  // @scaffolder add props here
}

export interface CollaborativewallHomeScreenNavParams {
  // requiredFoo: string; // @scaffolder remove example
  // optionalBar?: number; // @scaffolder remove example
  // @scaffolder add nav params here
}

export interface CollaborativewallHomeScreenPrivateProps
  extends NativeStackScreenProps<CollaborativewallNavigationParams, 'home'>,
    CollaborativewallHomeScreenProps {
  // @scaffolder add HOC props here
}
