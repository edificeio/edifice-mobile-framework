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
    width: layoutSize.LAYOUT_60,
    height: layoutSize.LAYOUT_60,
    borderRadius: layoutSize.LAYOUT_30,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    backgroundColor: CommonStyles.profileTypes.Student,
    elevation: 3, // Android
  });

export const ButtonIconText = ({ name, onPress, children }: ButtonTextIconProps) => {
  return (
    <Container>
      <TouchableOpacity onPress={onPress}>
        <Icon color="white" size={layoutSize.LAYOUT_32} name={name} />
      </TouchableOpacity>
      <TextBold15>{children}</TextBold15>
    </Container>
  );
};
