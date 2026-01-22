import { ImageURISource, ScrollViewProps } from 'react-native';

import { CommunityResponseDto } from '@edifice.io/community-client-rest-rn';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesHomeScreen {
  export interface NavParams {
    communityId: number;
    showWelcome?: boolean;
    invitationId?: number;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'home'>;
  export type AllProps = CommunitiesHomeScreen.NavigationProps;
  export type RequiredData = Pick<CommunityResponseDto, 'title' | 'welcomeNote'> & {
    totalMembers: number;
    membersId: string[];
    session: AuthActiveAccount;
    image: ImageURISource[];
  };
  export type AllPropsLoaded = CommunitiesHomeScreen.AllProps & RequiredData & Pick<ScrollViewProps, 'refreshControl'>;
}
