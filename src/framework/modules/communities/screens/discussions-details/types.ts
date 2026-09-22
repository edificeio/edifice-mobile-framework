import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesDiscussionDetailsScreen {
  export interface NavParams {
    communityId: number;
    discussionId: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'discussionDetails'>;
  export type AllProps = CommunitiesDiscussionDetailsScreen.NavigationProps;
}
