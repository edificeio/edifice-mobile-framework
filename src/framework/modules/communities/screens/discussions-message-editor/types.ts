import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesDiscussionMessageEditorScreen {
  export interface NavParams {
    communityId: number;
    discussionId: number;
    messageId?: number;
    page?: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'discussionMessageEditor'>;
  export type AllProps = CommunitiesDiscussionMessageEditorScreen.NavigationProps;
}
