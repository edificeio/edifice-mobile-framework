import * as React from 'react';
import { ColorValue, StyleProp, TextStyle, View, ViewStyle } from 'react-native';

import { Status } from '~/ui/avatars/Avatar';

import { BadgeAvatar, BadgePosition } from './badgeAvatar';
import { UI_SIZES } from './constants';
import { Text } from './text';

export interface BadgeAvatarProps {
  text: string;
  userId:
    | string
    | {
        id: string;
        isGroup: boolean;
      };
  viewStyle?: ViewStyle;
  textStyle?: StyleProp<TextStyle>;
  badgeContent?: number | string;
  badgeColor?: string | ColorValue;
  badgePosition?: BadgePosition;
  customAvatarStyle?: ViewStyle;
  status?: Status;
  size?: number;
  isHorizontal?: boolean;
}

export const TextAvatar = ({
  text,
  userId,
  viewStyle,
  textStyle,
  badgeContent,
  badgeColor,
  badgePosition,
  customAvatarStyle,
  status,
  size,
  isHorizontal,
}: BadgeAvatarProps) => {
  return (
    <View
      style={[
        {
          alignItems: 'center',
          flexDirection: isHorizontal ? 'row' : 'column',
          width: isHorizontal ? undefined : 48,
        },
        viewStyle,
      ]}>
      <BadgeAvatar
        userId={userId}
        badgeContent={badgeContent}
        badgeColor={badgeColor}
        badgePosition={badgePosition}
        customStyle={customAvatarStyle}
        status={status}
        size={size}
      />
      <Text
        numberOfLines={1}
        style={[
          {
            marginHorizontal: isHorizontal ? UI_SIZES.spacing.smallPlus : -UI_SIZES.spacing.smallPlus,
            textAlign: isHorizontal ? 'auto' : 'center',
            marginTop: isHorizontal ? undefined : UI_SIZES.spacing.tiny,
            flex: 1,
          },
          textStyle,
        ]}>
        {text}
      </Text>
    </View>
  );
};
