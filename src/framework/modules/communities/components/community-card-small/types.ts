import { ImageSourcePropType, ViewStyle } from 'react-native';

import { InvitationStatus } from '@edifice.io/community-client-rest-rn';

export interface CommunityCardSmallProps<ItemT = unknown> {
  hasNewContent?: boolean;
  image?: ImageSourcePropType;
  invitationStatus?: InvitationStatus;
  item: ItemT;
  itemSeparatorStyle?: ViewStyle;
  membersCount?: number;
  onPress: (item: ItemT) => void;
  title?: string;
}
