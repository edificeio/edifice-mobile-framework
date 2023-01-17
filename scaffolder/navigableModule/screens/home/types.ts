import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { {{moduleName | capitalize}}NavigationParams } from '../../navigation';

export interface {{moduleName | capitalize}}HomeScreenProps {
  // @scaffolder add props here
};

export interface {{moduleName | capitalize}}HomeScreenPrivateProps extends NativeStackScreenProps<{{moduleName | capitalize}}NavigationParams, 'Home'>, {{moduleName | capitalize}}HomeScreenProps {
  // @scaffolder add HOC props here
};
