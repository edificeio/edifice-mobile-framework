import * as React from 'react';
import { TextStyle, View, ViewStyle } from 'react-native';

import { Status } from '~/ui/avatars/Avatar';

import { BadgeAvatar, BadgePosition } from './badgeAvatar';
import { UI_SIZES } from './constants';
import { Text, TextSizeStyle } from './text';

export interface BadgeAvatarProps {
  text: string;
  textStyle: TextStyle;
  userId:
    | string
    | {
        id: string;
        isGroup: boolean;
      };
  badgeContent: number | string;
  badgeColor?: string;
  badgePosition?: BadgePosition;
  customAvatarStyle?: ViewStyle;
  status?: Status;
  isHorizontal?: boolean;
}

export const TextAvatar = ({
  text,
  textStyle,
  isHorizontal,
  userId,
  badgeContent,
  badgeColor,
  badgePosition,
  customAvatarStyle,
  status,
}: BadgeAvatarProps) => {
  return (
    <View
      style={[
        {
          alignItems: 'center',
          flexDirection: isHorizontal ? 'row' : 'column',
          width: isHorizontal ? undefined : 48,
        },
      ]}>
      <BadgeAvatar
        userId={userId}
        badgeContent={badgeContent}
        badgeColor={badgeColor}
        badgePosition={badgePosition}
        customStyle={customAvatarStyle}
        status={status}
      />
      <Text
        numberOfLines={1}
        style={[
          {
            ...TextSizeStyle.Small,
            marginLeft: isHorizontal ? UI_SIZES.spacing.extraSmall : undefined,
            marginTop: isHorizontal ? undefined : UI_SIZES.spacing.tiny,
          },
          textStyle,
        ]}>
        {text}
      </Text>
    </View>
  );
};
