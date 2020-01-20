import style from "glamorous-native";
import * as React from "react";
import { CommonStyles } from "../styles/common/styles";
import { Icon } from "./icons/Icon";
import { layoutSize } from "../styles/common/layoutSize";
import { TextBold15 } from "./text";

export interface ButtonTextIconProps {
  onPress: () => any;
  children?: any;
  disabled?: boolean;
  name: string;
  size?: number;
  style?: any;
  whiteSpace?: string;
}

const Container = style.view(
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  (props: any) => ({
    style: props.style ? props.style : null,
  })
);

const TouchableOpacity = style.touchableOpacity( {
    alignItems: "center",
    justifyContent: "center",
    width: layoutSize.LAYOUT_48,
    height: layoutSize.LAYOUT_48,
    borderRadius: layoutSize.LAYOUT_24,
    backgroundColor: CommonStyles.profileTypes.Student,
  });

export const ButtonIconText = ({ name, onPress, children, size, style }: ButtonTextIconProps) => {
  return (
    <Container style={style}>
      <TouchableOpacity onPress={onPress}>
        <Icon color="white" size={size ? size : layoutSize.LAYOUT_24} name={name} />
      </TouchableOpacity>
      <TextBold15>{children}</TextBold15>
    </Container>
  );
};
