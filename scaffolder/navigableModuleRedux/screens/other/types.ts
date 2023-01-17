import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { {{moduleName | capitalize}}NavigationParams } from '../../navigation';

export interface {{moduleName | capitalize}}OtherScreenProps {
  // @scaffolder add props here
}

export type {{moduleName | capitalize}}OtherScreenNavParams = undefined;
// @scaffolder use interface and add nav params here

export interface {{moduleName | capitalize}}OtherScreenPrivateProps
  extends NativeStackScreenProps<{{moduleName | capitalize}}NavigationParams, 'Other'>,
    {{moduleName | capitalize}}OtherScreenProps {
  // @scaffolder add HOC props here
}
