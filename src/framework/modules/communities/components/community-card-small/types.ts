import { ImageSourcePropType, ViewStyle } from 'react-native';

import { InvitationStatus } from '@edifice.io/community-client-rest-rn';

export interface CommunityCardSmallProps {
  hasNewContent?: boolean;
  image?: ImageSourcePropType;
  invitationStatus: InvitationStatus;
  itemSeparatorStyle?: ViewStyle;
  membersCount?: number;
  onPress: () => void;
  title?: string;
}
