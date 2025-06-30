import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesListScreen {
  export interface NavParams {}
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'list'>;
  export type AllProps = CommunitiesListScreen.NavigationProps;
}
