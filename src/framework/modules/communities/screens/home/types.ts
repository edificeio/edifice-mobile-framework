import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesHomeScreen {
  export interface NavParams { }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'home'>;
  export type AllProps = CommunitiesHomeScreen.NavigationProps;
}
