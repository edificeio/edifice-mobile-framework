import style from "glamorous-native";
import * as React from "react";
import { TouchableOpacityProps } from "react-native";
const { TouchableOpacity } = style;
/**
 * A simple <TouchableOpacity> component, but with a default prop on it.
 */

export default (props: TouchableOpacityProps) => (
  <TouchableOpacity delayPressIn={50} {...props} />
);
