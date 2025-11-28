import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export interface DocumentsTileProps {
  navigation: NativeStackNavigationProp<CommunitiesNavigationParams>;
  communityId: number;
  totalMembers: number;
  membersId: string[];
}
