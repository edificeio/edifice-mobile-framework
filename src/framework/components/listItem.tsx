import * as React from "react";
import { View, ViewStyle } from "react-native";
import theme from "../theme";

export const ListItem = ({
  leftElement,
  rightElement,
  style
}: {
  leftElement: JSX.Element;
  rightElement: JSX.Element;
  style?: ViewStyle;
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: theme.color.cardBackground,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 10,
          borderBottomWidth: 0.25,
          borderBottomColor: theme.color.listItemBorder
        },
        style
      ]}
    >
      {leftElement}
      {rightElement}
    </View>
  );
}
