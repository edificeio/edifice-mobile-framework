import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { {{moduleName | toCamelCase | capitalize}}NavigationParams } from '~/framework/modules/{{moduleName}}/navigation';

export namespace {{ moduleName | toCamelCase | capitalize }}{{screenName | toCamelCase | capitalize}}Screen {
  export interface NavParams {
    // @scaffolder Declare Nav Params here
  }
  export type NavigationProps = NativeStackScreenProps<{{ moduleName | toCamelCase | capitalize }}NavigationParams, '{{screenName | toCamelCase}}' >
  export interface AllProps extends NavigationProps {}
}
