import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { {{moduleName | toCamelCase | capitalize}}NavigationParams } from '~/framework/modules/module-name/navigation';

export interface {{moduleName | toCamelCase | capitalize}}OtherScreenProps {
  // @scaffolder add props here
}

export type {{moduleName | toCamelCase | capitalize}}OtherScreenNavParams = undefined; // @scaffolder declare interface if you have navParams for this screen

export interface {{moduleName | toCamelCase | capitalize}}OtherScreenPrivateProps
  extends NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, 'other'>,
    {{moduleName | toCamelCase | capitalize}}OtherScreenProps {
  // @scaffolder add HOC props here
}
