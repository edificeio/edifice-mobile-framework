import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesConversationScreen {
  export interface NavParams {
    communityId: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'conversation'>;
  export type AllProps = CommunitiesConversationScreen.NavigationProps;
}
