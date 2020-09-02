import * as React from "react";
import { TouchableOpacity, Platform } from "react-native";
import { hasNotch } from "react-native-device-info";
import { iosStatusBarHeight } from "./headers/Header";
import { Icon } from ".";

interface FullScreenActionProps {
  iconName: string;
  action: () => void;
  customStyle?: object;
  customIconSize?: number;
  customIconColor?: number;
}

export const FullScreenAction = ({ iconName, action, customStyle, customIconSize, customIconColor }: FullScreenActionProps) => (
  <TouchableOpacity
    onPress={action}
    style={[{
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        borderRadius: 20,
        height: 40,
        width: 40,
        right: 5,
        top: Platform.OS === "ios" ? hasNotch() ? iosStatusBarHeight + 20 : 20 : 0,
        backgroundColor: "rgba(0,0,0,0.3)",
      },
      customStyle
    ]}
  >
    <Icon size={customIconSize || 16} color={customIconColor || "#ffffff"} name={iconName} />
  </TouchableOpacity>
);
