import style from "glamorous-native";
import * as React from "react";
import { StyleSheet } from "react-native";
import { CommonStyles } from "../styles/common/styles";
import { Icon } from "./icons/Icon";
import { layoutSize } from "../styles/common/layoutSize";
import { TextBold15 } from "./text";

export interface ButtonTextIconProps {
  onPress: () => any;
  children?: any,
  disabled?: boolean;
  name: string,
  whiteSpace?: string;
}

const Container = style.view({
  alignItems: "center",
  justifyContent: "space-evenly",
});

const TouchableOpacity = style.touchableOpacity( {
    alignItems: "center",
    justifyContent: "center",
    width: layoutSize.LAYOUT_42,
    height: layoutSize.LAYOUT_42,
    borderRadius: layoutSize.LAYOUT_20,
    backgroundColor: CommonStyles.profileTypes.Student,
  });

export const ButtonIconText = ({ name, onPress, children }: ButtonTextIconProps) => {
  return (
    <Container>
      <TouchableOpacity onPress={onPress}>
        <Icon color="white" size={layoutSize.LAYOUT_24} name={name} />
      </TouchableOpacity>
      <TextBold15>{children}</TextBold15>
    </Container>
  );
};
