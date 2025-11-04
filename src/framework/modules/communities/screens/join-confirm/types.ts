import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesJoinConfirmScreen {
  export interface NavParams {
    communityId: number;
    invitationId: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'joinConfirm'>;
  export interface AllProps extends NavigationProps {}
}
