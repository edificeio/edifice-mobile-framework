import * as React from 'react';
import { ColorValue, StyleProp, TextStyle, View, ViewStyle } from 'react-native';

import { Status } from '~/ui/avatars/Avatar';

import { BadgeAvatar, BadgePosition } from './badgeAvatar';
import { UI_SIZES } from './constants';
import { SmallText } from './text';

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
          paddingTop: 2, // to fix border when avatar is selected
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
      <SmallText
        numberOfLines={1}
        style={[
          {
            marginHorizontal: isHorizontal ? UI_SIZES.spacing.minor : -UI_SIZES.spacing.minor,
            textAlign: isHorizontal ? 'auto' : 'center',
            marginTop: isHorizontal ? undefined : UI_SIZES.spacing.tiny,
            flexShrink: 1,
          },
          textStyle,
        ]}>
        {text}
      </SmallText>
    </View>
  );
};
