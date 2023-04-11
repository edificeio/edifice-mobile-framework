import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { {{moduleName | toCamelCase | capitalize}}NavigationParams } from '~/framework/modules/module-name/navigation';

export interface {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenProps {
  // @scaffolder add props here
}

export interface {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenNavParams {
  // requiredFoo: string; // @scaffolder remove example
  // optionalBar?: number; // @scaffolder remove example
  // @scaffolder add nav params here
}

export interface {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenPrivateProps
  extends NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, '{{screenName | toCamelCase}}'>,
    {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenProps {
  // @scaffolder add HOC props here
}
