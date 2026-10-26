import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesDiscussionDetailsScreen {
  export interface NavParams {
    communityId: number;
    discussionId: number;
    /** Set by the message editor when it closes, so this screen reloads the affected page. */
    lastMutation?: { type: 'created' | 'updated'; messageId: number; at: number };
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'discussionDetails'>;
  export type AllProps = CommunitiesDiscussionDetailsScreen.NavigationProps;
}
