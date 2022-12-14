import * as React from 'react';
import { ImageURISource, View, ViewStyle } from 'react-native';

import { Badge } from './Badge';
import { GridAvatars } from './avatars/GridAvatars';

export interface BadgeAvatarProps {
  avatars: Array<string | ImageURISource>;
  badgeContent: number | string;
  badgeColor?: string;
  customStyle?: ViewStyle;
}

export const BadgeAvatar = ({ avatars, badgeContent, badgeColor, customStyle }: BadgeAvatarProps) => {
  return (
    <View>
      <GridAvatars users={avatars} />
      <View style={[{ position: 'absolute', bottom: 0, left: 0 }, customStyle]}>
        <Badge content={badgeContent} color={badgeColor} />
      </View>
    </View>
  );
};
