import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { addValueAction } from '~/framework/modules/{{moduleName}}/actions';
import type { {{moduleName | toCamelCase | capitalize}}NavigationParams } from '~/framework/modules/{{moduleName}}/navigation';
import type { {{moduleName | toCamelCase | capitalize}}State } from '~/framework/modules/{{moduleName}}/reducer';

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenProps {
  // @scaffolder add props here
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams {
  // @scaffolder add nav params here
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenStoreProps {
  basicValue: {{moduleName | toCamelCase | capitalize}}State['basicValue'];
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenDispatchProps {
  handleAddValue: (...args: Parameters<typeof addValueAction>) => ReturnType<ReturnType<typeof addValueAction>>;
  tryAddValue: (...args: Parameters<typeof addValueAction>) => ReturnType<ReturnType<typeof addValueAction>>;
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps
  extends NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, 'home'>,
    {{moduleName | toCamelCase | capitalize}}HomeScreenProps,
    {{moduleName | toCamelCase | capitalize}}HomeScreenStoreProps,
    {{moduleName | toCamelCase | capitalize}}HomeScreenDispatchProps {
  // @scaffolder add HOC props here
}
