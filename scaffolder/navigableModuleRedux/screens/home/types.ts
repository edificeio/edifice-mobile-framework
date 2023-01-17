import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { setFruitAction } from '../../actions';
import { {{moduleName | capitalize}}NavigationParams } from '../../navigation';
import { {{moduleName | capitalize}}State } from '../../reducer';

export interface {{moduleName | capitalize}}HomeScreenProps {
  // @scaffolder add props here
}

export interface {{moduleName | capitalize}}HomeScreenNavParams {
  requiredFoo: string;
  optionalBar?: number;
  // @scaffolder remove examples add nav params here
}

export interface {{moduleName | capitalize}}HomeScreenStoreProps {
  fruit: {{moduleName | capitalize}}State['fruit'];
}

export interface {{moduleName | capitalize}}HomeScreenDispatchProps {
  handleChangeFruit: (...args: Parameters<typeof setFruitAction>) => Promise<void>;
}

export interface {{moduleName | capitalize}}HomeScreenPrivateProps
  extends NativeStackScreenProps<{{moduleName | capitalize}}NavigationParams, 'Home'>,
    {{moduleName | capitalize}}HomeScreenProps,
    {{moduleName | capitalize}}HomeScreenStoreProps,
    {{moduleName | capitalize}}HomeScreenDispatchProps {
  // @scaffolder add HOC props here
}
