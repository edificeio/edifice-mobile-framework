import * as React from 'react';
import { ColorValue, StyleProp, TextStyle, View, ViewStyle } from 'react-native';

import { BadgeAvatar, BadgePosition } from './badgeAvatar';
import { UI_SIZES } from './constants';
import { SmallText } from './text';

import { Status } from '~/ui/avatars/Avatar';

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
  badgeColor,
  badgeContent,
  badgePosition,
  customAvatarStyle,
  isHorizontal,
  size,
  status,
  text,
  textStyle,
  userId,
  viewStyle,
}: BadgeAvatarProps) => {
  return (
    <View
      style={[
        {
          alignItems: 'center',
          flexDirection: isHorizontal ? 'row' : 'column',
          paddingTop: 2,
          width: isHorizontal ? undefined : 48, // to fix border when avatar is selected
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
            flexShrink: 1,
            marginHorizontal: isHorizontal ? UI_SIZES.spacing.minor : -UI_SIZES.spacing.minor,
            marginTop: isHorizontal ? undefined : UI_SIZES.spacing.tiny,
            textAlign: isHorizontal ? 'auto' : 'center',
          },
          textStyle,
        ]}>
        {text}
      </SmallText>
    </View>
  );
};
