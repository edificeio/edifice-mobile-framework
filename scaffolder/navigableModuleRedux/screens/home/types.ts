import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { setFruitAction } from '../../actions';
import type { {{moduleName | toCamelCase | capitalize}}NavigationParams } from '../../navigation';
import type { {{moduleName | toCamelCase | capitalize}}State } from '../../reducer';

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenProps {
  // @scaffolder add props here
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams {
  requiredFoo: string;
  optionalBar?: number;
  // @scaffolder remove examples add nav params here
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenStoreProps {
  fruit: {{moduleName | toCamelCase | capitalize}}State['fruit'];
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenDispatchProps {
  handleChangeFruit: (...args: Parameters<typeof setFruitAction>) => Promise<void>;
}

export interface {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps
  extends NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, 'Home'>,
    {{moduleName | toCamelCase | capitalize}}HomeScreenProps,
    {{moduleName | toCamelCase | capitalize}}HomeScreenStoreProps,
    {{moduleName | toCamelCase | capitalize}}HomeScreenDispatchProps {
  // @scaffolder add HOC props here
}
