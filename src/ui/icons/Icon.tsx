import * as React from "react";
import { TextProperties } from "react-native";
import { createIconSetFromIcoMoon } from "react-native-vector-icons";
const icoMoonConfig = require("../../../assets/selection.json");

console.log("Icon set:", icoMoonConfig);
export const Icon = createIconSetFromIcoMoon(icoMoonConfig);

export const checkHasIcon = (name:string) => Icon.hasIcon(name)

export interface IconProps extends TextProperties {
  color?: any;
  focused?: boolean;
  name?: string;
  paddingHorizontal?: number;
  size?: number;
}
