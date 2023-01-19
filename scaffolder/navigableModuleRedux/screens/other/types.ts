import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { setFruitAction } from '../../actions';
import type { {{moduleName | toCamelCase | capitalize}}NavigationParams } from '../../navigation';
import type { {{moduleName | toCamelCase | capitalize}}State } from '../../reducer';

export interface {{moduleName | toCamelCase | capitalize}}OtherScreenProps {
  // @scaffolder add props here
}

export interface {{moduleName | toCamelCase | capitalize}}OtherScreenNavParams {
  handleAdd?: () => void;
}

export interface {{moduleName | toCamelCase | capitalize}}OtherScreenStoreProps {
  fruit: {{moduleName | toCamelCase | capitalize}}State['fruit'];
  counter: {{moduleName | toCamelCase | capitalize}}State['nbUpdates'];
}

export interface {{moduleName | toCamelCase | capitalize}}OtherScreenDispatchProps {
  handleChangeFruit: (...args: Parameters<typeof setFruitAction>) => Promise<void>;
}


export interface {{moduleName | toCamelCase | capitalize}}OtherScreenPrivateProps 
  extends NativeStackScreenProps<{{moduleName | toCamelCase | capitalize}}NavigationParams, 'other'>,
    {{moduleName | toCamelCase | capitalize}}OtherScreenProps,
    {{moduleName | toCamelCase | capitalize}}OtherScreenStoreProps,
    {{moduleName | toCamelCase | capitalize}}OtherScreenDispatchProps {
  // @scaffolder add HOC props here
}
