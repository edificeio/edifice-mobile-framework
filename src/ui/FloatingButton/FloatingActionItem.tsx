import * as React from "react";
import { CenterPanel, LeftIconPanel } from "../ContainerContent";
import { Icon } from "..";
import { IEventProps, EVENT_TYPE } from "../../types";
import { IMenuItem } from "../types";
import { layoutSize } from "../../styles/common/layoutSize";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../../framework/components/text";

const Item = ({ onEvent, item, eventHandleData }: IEventProps & any) => {
  const { icon, text } = item as IMenuItem;

  const view = <View
    style={style.touchPanel}>
    <LeftIconPanel style={style.leftPanel}>
      <Icon color="#000000" size={layoutSize.LAYOUT_28} name={icon} />
    </LeftIconPanel>
    <CenterPanel style={style.centerPanel}>
      <Text numberOfLines={1} style={style.fileName}>
        {text}
      </Text>
    </CenterPanel>
  </View>

  if (item.wrapper) {
    const ItemWrapper = item.wrapper;
    return <ItemWrapper {...eventHandleData} >{view}</ItemWrapper>;
  } else {
    return <TouchableOpacity onPress={() => onEvent({ type: EVENT_TYPE.MENU_SELECT, id: item.id, item })}>{view}</TouchableOpacity>
  }
};

export default Item;

const style = StyleSheet.create({
  centerPanel: {
    alignItems: "center",
    backgroundColor: "transparent",
    flexDirection: "row",
    flexGrow: 3,
    justifyContent: "flex-start",
    margin: 2,
    marginLeft: -20,
  },
  fileName: {
    color: "#000000",
    fontSize: layoutSize.LAYOUT_14,
  },
  leftPanel: {
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: layoutSize.LAYOUT_58,
    flexGrow: 0,
    margin: 2,
    padding: 2,
  },
  touchPanel: {
    backgroundColor: "transparent",
    flexDirection: "row",
    flex: 1,
    paddingLeft: 5,
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
