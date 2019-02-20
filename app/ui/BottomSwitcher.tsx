import * as React from "react";
import { TouchableOpacity } from "react-native";
import { Icon } from ".";
import { CommonStyles } from "../styles/common/styles";
import { Label } from "./Typography";

export interface IBottomSwitcherProps {
  onPress: () => void;
}

const BottomSwitcher: React.StatelessComponent<
  IBottomSwitcherProps
> = props => (
  <TouchableOpacity
    onPress={props.onPress}
    style={{
      alignItems: "center",
      backgroundColor: "#F8F8FA",
      borderTopColor: "#DCDDE0",
      borderTopWidth: 1,
      height: 56,
      justifyContent: "center",
      width: "100%"
    }}
  >
    <Label>
      {props.children}{" "}
      <Icon size={9} color={CommonStyles.lightTextColor} name="arrow_down" />
    </Label>
  </TouchableOpacity>
);

export default BottomSwitcher;
