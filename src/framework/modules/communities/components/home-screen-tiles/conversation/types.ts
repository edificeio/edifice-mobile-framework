import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CommunitiesNavigationParams } from '~/framework/modules/communities/navigation';

export interface ConversationTileProps {
  communityId: number;
  hasDiscussions: boolean;
  platformUrl: string;
  hasUnreadMessages: boolean;
  navigation: NativeStackNavigationProp<CommunitiesNavigationParams>;
  totalDiscussions: number;
}
