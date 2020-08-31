import * as React from "react";
import { TouchableOpacity, Platform } from "react-native";
import { hasNotch } from "react-native-device-info";
import { iosStatusBarHeight } from "./headers/Header";
import { Icon } from ".";

interface FullScreenActionProps {
  icon: string;
  action: () => void;
  customStyle?: object;
}

export const FullScreenAction = ({ icon, action, customStyle }: FullScreenActionProps) => (
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
    <Icon size={16} color="#ffffff" name={icon} />
  </TouchableOpacity>
);
