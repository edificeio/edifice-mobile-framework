import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export namespace CommunitiesSpotlightedCourseScreen {
  export interface NavParams {
    communityId: number;
    platformUrl: string;
  }
  export type NavigationProps = NativeStackScreenProps<CommunitiesNavigationParams, 'spotlightedCourse'>;
  export type AllProps = CommunitiesSpotlightedCourseScreen.NavigationProps;
}
