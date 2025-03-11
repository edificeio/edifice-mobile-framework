import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { WikiNavigationParams } from '~/framework/modules/wiki/navigation';

export namespace WikiCreateScreen {
  export interface NavParams { }
  export type NavigationProps = NativeStackScreenProps<WikiNavigationParams, 'create'>;

  export type NavBarConfig = ({ navigation, route }: NavigationProps) => NativeStackNavigationOptions;

  export interface AllProps extends NavigationProps { }
}
