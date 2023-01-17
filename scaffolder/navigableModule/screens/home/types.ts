import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { {{moduleName | capitalize}}NavigationParams } from '../../navigation';

export interface {{moduleName | capitalize}}HomeScreenProps {
  // @scaffolder add props here
}

export interface {{moduleName | capitalize}}HomeScreenNavParams {
  requiredFoo: string;
  optionalBar?: number;
  // @scaffolder remove examples add nav params here
}

export interface {{moduleName | capitalize}}HomeScreenPrivateProps 
  extends NativeStackScreenProps<{{moduleName | capitalize}}NavigationParams, 'Home'>,
    {{moduleName | capitalize}}HomeScreenProps {
  // @scaffolder add HOC props here
}
