import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesDiscussionsScreen {
  export interface NavParams {
    communityId: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'discussions'>;
  export type AllProps = CommunitiesDiscussionsScreen.NavigationProps;
}
