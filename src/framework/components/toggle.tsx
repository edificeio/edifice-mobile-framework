import * as React from "react";
import { Switch } from "react-native";
import theme from "~/framework/util/theme";

export interface IToggleProps {
  checked: boolean;
  onCheckChange: () => void;
}

export const Toggle = ({ checked, onCheckChange }: IToggleProps) => (
  <Switch
    value={checked}
    onValueChange={() => onCheckChange && onCheckChange()}
    trackColor={{ false: theme.color.neutral.extraLight, true: theme.color.secondary.regular }}
  />
);
