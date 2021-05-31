import * as React from "react";
import { Switch } from "react-native";
import theme from "../util/theme";

export interface IToggleProps {
  checked: boolean;
  onCheckChange: () => void;
}

export const Toggle = ({ checked, onCheckChange }: IToggleProps) => (
  <Switch
    value={checked}
    onValueChange={() => onCheckChange && onCheckChange()}
    trackColor={{ false: theme.color.tertiary.light, true: theme.color.secondary.regular }}
  />
);
