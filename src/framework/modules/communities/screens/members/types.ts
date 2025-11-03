import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesMembersScreen {
  export interface NavParams {
    communityId: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'members'>;
  export type AllProps = CommunitiesMembersScreen.NavigationProps;
}
