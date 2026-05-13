import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export interface CoursesTileProps {
  navigation: NativeStackNavigationProp<CommunitiesNavigationParams>;
  spotlightedCourseId?: string;
}
