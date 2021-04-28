import * as React from "react";
import { View } from "react-native";
import theme from "../theme";

export const ListItem = ({
  leftElement,
  rightElement
}: {
  leftElement: JSX.Element;
  rightElement: JSX.Element;
}) => {
  return (
    <View
      style={{
        backgroundColor: theme.color.cardBackground,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 0.25,
        borderBottomColor: theme.color.listItemBorder
      }}
    >
      {leftElement}
      {rightElement}
    </View>
  );
}
