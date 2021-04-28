import * as React from "react";
import { View, ViewStyle } from "react-native";
import theme from "../theme";

export const ListItem = ({
  leftElement,
  rightElement,
  style
}: {
  leftElement?: JSX.Element | null;
  rightElement?: JSX.Element | null;
  style?: ViewStyle;
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: theme.color.background.card,
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
      {leftElement || null}
      {rightElement || null}
    </View>
  );
}
