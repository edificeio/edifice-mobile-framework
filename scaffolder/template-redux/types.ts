import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { {{moduleName | toCamelCase | capitalize}}NavigationParams } from '~/framework/modules/{{moduleName}}/navigation';

export interface {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenProps {
  // @scaffolder add props here
}

export interface {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenNavParams {
  // @scaffolder add nav params here. Use type `undefined` if no navParams at all.
}

export interface {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenStoreProps {
  // @scaffolder add store props here
}

export interface {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenDispatchProps {
  // @scaffolder add dispatch props here
}


export interface {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenPrivateProps
  extends NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, '{{screenName | toCamelCase}}'>,
    {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenProps,
    {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenStoreProps,
    {{moduleName | toCamelCase | capitalize}}{{screenName | toCamelCase | capitalize}}ScreenDispatchProps {
  // @scaffolder add HOC props here
}
