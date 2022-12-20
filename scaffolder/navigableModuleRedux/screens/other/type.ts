import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { {{moduleName | capitalize}}NavigationParams } from '../../navigation';

export interface {{moduleName | capitalize}}OtherScreenProps {
  // @scaffolder add props here
}

export interface {{moduleName | capitalize}}OtherScreenAllProps extends NativeStackScreenProps<{{moduleName | capitalize}}NavigationParams, 'Other'>, {{moduleName | capitalize}}OtherScreenProps {
  // @scaffolder add HOC props here
}
