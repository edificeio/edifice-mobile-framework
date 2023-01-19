import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { {{moduleName | toCamelCase | capitalize}}NavigationParams } from '../../navigation';

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenProps {
  // @scaffolder add props here
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams {
  requiredFoo: string; // @scaffolder remove example
  optionalBar?: number; // @scaffolder remove example
  // @scaffolder add nav params here
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps 
  extends NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, 'home'>,
    {{moduleName | toCamelCase | capitalize}}HomeScreenProps {
  // @scaffolder add HOC props here
}
