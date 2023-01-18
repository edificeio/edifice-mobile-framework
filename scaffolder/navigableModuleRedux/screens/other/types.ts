import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { {{moduleName | toCamelCase | capitalize}}NavigationParams } from '../../navigation';

export interface {{moduleName | toCamelCase | capitalize}}OtherScreenProps {
  // @scaffolder add props here
}

export type {{moduleName | toCamelCase | capitalize}}OtherScreenNavParams = undefined;
// @scaffolder use interface and add nav params here

export interface {{moduleName | toCamelCase | capitalize}}OtherScreenPrivateProps
  extends NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, 'Other'>,
    {{moduleName | toCamelCase | capitalize}}OtherScreenProps {
  // @scaffolder add HOC props here
}
