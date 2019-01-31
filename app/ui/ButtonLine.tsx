import style from "glamorous-native";
import * as React from "react";
import { RowProperties } from ".";
import I18n from "i18n-js";
import TouchableOpacity from "../ui/CustomTouchableOpacity";
import { Icon } from "./icons/Icon";

const Container = style(TouchableOpacity)({
  alignItems: "center",
  flexDirection: "row",
  backgroundColor: "white",
  borderBottomWidth: 1,
  borderColor: "#ddd",
  height: 46,
  justifyContent: "flex-start",
  marginTop: 20,
  paddingHorizontal: 15
});

const LinkStyle = style.text(
  {
    fontSize: 14,
    flex: 1
  },
  ({ color }) => ({
    color: color || "#414355"
  })
);

export const ButtonLine = ({
  onPress,
  title,
  color,
  hideIcon
}: {
  onPress: () => any;
  title: string;
  color?: string;
  hideIcon?: boolean;
}) => (
  <Container onPress={() => onPress()}>
    {/* FIXME: a ButtonLine without onClick prop will raise an error. Fire an event up or use onPress={onPress}. */}
    <LinkStyle color={color}>{I18n.t(title)}</LinkStyle>
    {/* FIXME: This UI button force to use translation. It shouldn't. */}
    {!hideIcon && (
      <Icon
        name="arrow_down"
        color={"#868CA0"}
        style={{ transform: [{ rotate: "270deg" }] }}
      />
    )}
  </Container>
);
