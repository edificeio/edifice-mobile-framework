import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TestTahitiNavigationParams } from '~/framework/modules/test-tahiti/navigation';

export interface TestTahitiHomeScreenProps {
  // @scaffolder add props here
}

export interface TestTahitiHomeScreenNavParams {
  // requiredFoo: string; // @scaffolder remove example
  // optionalBar?: number; // @scaffolder remove example
  // @scaffolder add nav params here
}

export interface TestTahitiHomeScreenPrivateProps
  extends NativeStackScreenProps<TestTahitiNavigationParams, 'home'>,
    TestTahitiHomeScreenProps {
  // @scaffolder add HOC props here
}
