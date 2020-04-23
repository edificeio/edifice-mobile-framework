import * as React from "react";
import { CenterPanel, LeftIconPanel } from "../ContainerContent";
import { Icon } from "..";
import { IEventProps, EVENT_TYPE } from "../../types";
import { IMenuItem } from "../types";
import { layoutSize } from "../../styles/common/layoutSize";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "../text";

const Item = ({ onEvent, item }: IEventProps & any) => {
  const { icon, text } = item as IMenuItem;

  return (
    <TouchableOpacity
      style={style.touchPanel}
      onPress={() => onEvent({ type: EVENT_TYPE.MENU_SELECT, id: item.id, item })}
    >
      <LeftIconPanel style={style.leftPanel}>
        <Icon color="#ffffff" size={layoutSize.LAYOUT_28} name={icon} />
      </LeftIconPanel>
      <CenterPanel style={style.centerPanel}>
        <Text numberOfLines={1} style={style.fileName}>
          {text}
        </Text>
      </CenterPanel>
    </TouchableOpacity>
  );
};

export default Item;

const style = StyleSheet.create({
  centerPanel: {
    alignItems: "center",
    backgroundColor: "#ff8000",
    flexDirection: "row",
    flexGrow: 3,
    justifyContent: "flex-start",
    margin: 2,
    marginLeft: -20,
  },
  fileName: {
    color: "#ffffff",
    fontSize: layoutSize.LAYOUT_14,
  },
  leftPanel: {
    backgroundColor: "#ff8000",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: layoutSize.LAYOUT_58,
    flexGrow: 0,
    margin: 2,
    padding: 2,
  },
  touchPanel: {
    backgroundColor: "#ff8000",
    flexDirection: "row",
    flex: 1,
    paddingLeft: 5,
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
