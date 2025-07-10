import { CommunityType } from '@edifice.io/community-client-rest-rn';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export interface CommunitiesPendingInvitationsFilter {
  isActive: boolean;
  pendingInvitationsCount: number;
}

export namespace CommunitiesListScreen {
  export interface NavParams {
    filters?: CommunityType[];
    pending?: boolean;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'list'>;
  export type AllProps = CommunitiesListScreen.NavigationProps;
}
