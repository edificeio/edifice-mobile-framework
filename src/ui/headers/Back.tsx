import * as React from "react";
import { Platform } from "react-native";
import { HeaderIcon } from "./Header";

export const Back = ({ navigation }) => (
  <HeaderIcon
    onPress={() => navigation.goBack(null)}
    name={Platform.OS === "ios" ? "chevron-left1" : "back"}
    iconSize={24}
  />
);
