import { ScrollViewProps } from 'react-native';

import { CommunityResponseDto } from '@edifice.io/community-client-rest-rn';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesHomeScreen {
  export interface NavParams {
    communityId: number;
    showWelcome?: boolean;
    invitationId?: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'home'>;
  export type AllProps = CommunitiesHomeScreen.NavigationProps;
  export type RequiredData = Pick<CommunityResponseDto, 'title' | 'image' | 'welcomeNote'> & {
    totalMembers: number;
    membersId: string[];
  };
  export type AllPropsLoaded = CommunitiesHomeScreen.AllProps & RequiredData & Pick<ScrollViewProps, 'refreshControl'>;
}
