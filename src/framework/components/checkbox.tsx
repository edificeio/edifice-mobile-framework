import * as React from "react";
import { ColorValue, TouchableOpacity, ViewStyle } from "react-native";
import theme from "../util/theme";
import { Icon } from "./icon";

export const Checkbox = ({
  checked,
  onPress,
  customContainerStyle,
  customCheckboxColor
}: {
  checked: boolean;
  onPress: () => void;
  customContainerStyle?: ViewStyle;
  customCheckboxColor?: ColorValue;
}) => (
  <TouchableOpacity
    onPress={() => onPress && onPress()}
    style={[
      {
        width: 25,
        height: 25,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: checked ? theme.color.secondary.regular : theme.color.text.inverse,
        borderColor: checked ? theme.color.secondary.regular : theme.color.text.light,
        borderWidth: checked ? 0 : 2,  
      },
      customContainerStyle
    ]}
  >
    <Icon size={15} name="checked" color={customCheckboxColor || theme.color.text.inverse}/>
  </TouchableOpacity>
);
