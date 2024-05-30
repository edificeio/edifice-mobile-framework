import * as React from 'react';
import { ColorValue, View, ViewStyle } from 'react-native';

import { Status } from '~/ui/avatars/Avatar';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import { Badge } from './badge';

export enum BadgePosition {
  top,
  bottom,
}

export interface BadgeAvatarProps {
  userId:
    | string
    | {
        id: string;
        isGroup: boolean;
      };
  badgeContent?: number | string;
  badgeColor?: string | ColorValue;
  badgePosition?: BadgePosition;
  customStyle?: ViewStyle;
  status?: Status;
  size?: number;
}

export const BadgeAvatar = ({ userId, badgeContent, badgeColor, badgePosition, customStyle, status, size }: BadgeAvatarProps) => {
  const position =
    badgePosition === BadgePosition.top
      ? {
          top: 0,
          right: 0,
        }
      : badgePosition === BadgePosition.bottom
        ? {
            bottom: 0,
            right: 0,
          }
        : {
            top: 0,
            right: 0,
          };

  return (
    <View style={{ alignSelf: 'flex-start' }}>
      <SingleAvatar size={size || 48} userId={userId} status={status} />
      <View style={[{ position: 'absolute', ...position }, customStyle]}>
        {badgeContent ? <Badge content={badgeContent} color={badgeColor} /> : null}
      </View>
    </View>
  );
};
