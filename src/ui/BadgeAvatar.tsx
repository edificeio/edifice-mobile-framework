import * as React from "react";
import { View } from "react-native";
import { Badge } from "./Badge";
import { GridAvatars } from "./avatars/GridAvatars";

export interface BadgeAvatarProps {
  avatars: string[];
  badgeContent: number | string;
  badgeColor?: string;
}

export const BadgeAvatar = ({ avatars, badgeContent, badgeColor }: BadgeAvatarProps) => {
  return (
    <View>
      <GridAvatars users={avatars} />
      <View style={{ position: "absolute", bottom: 0, left: 0 }}>
        <Badge content={badgeContent} color={badgeColor} />
      </View>
    </View>
  );
};
