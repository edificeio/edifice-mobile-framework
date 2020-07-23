import * as React from "react";
import { View, ViewStyle } from "react-native";
import { Icon } from ".";
import { CommonStyles } from "../styles/common/styles"

export const IconButton = (props: { iconName: string, iconColor?: string, iconSize?: number, iconStyle?: ViewStyle, buttonStyle?: ViewStyle, disabled?: boolean }) => {
	return (
    <View
      style={[
        {
          backgroundColor: CommonStyles.secondary, 
          borderRadius: 15, 
          height: 30, 
          width: 30, 
          elevation: 1, 
          alignItems: "center", 
          justifyContent: "center",
          opacity: props.disabled ? 0.5 : 1,
        },
        props.buttonStyle
      ]}
    >
      <Icon
        name={props.iconName}
        color={props.iconColor || "#FFFFFF"}
        size={props.iconSize || 13}
        style={props.iconStyle}
      />
    </View>
  );
}
