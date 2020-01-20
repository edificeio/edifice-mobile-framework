import * as React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { EVENT_TYPE } from "../../types";
import { layoutSize } from "../../styles/common/layoutSize";
import { Text } from "../text";
import { Icon } from "..";

const Item = ({ onEvent, item, nbSelected }: any) => {
  const { icon, id, monoselection } = item;
  const disable = monoselection && nbSelected !== 1;

  if (id === "nbSelected") {
    return (
      <View style={styles.nbSelected}>
        <Text numberOfLines={1} style={styles.text}>
          {nbSelected}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.touchPanel}
      onPress={() => (disable ? null : onEvent({ type: EVENT_TYPE.MENU_SELECT, id: item.id, item }))}>
      <Icon color={disable ? "#e2e2e2" : "#ffffff"} size={layoutSize.LAYOUT_24} name={icon} />
    </TouchableOpacity>
  );
};

export default Item;

const styles = StyleSheet.create({
  touchPanel: {
    backgroundColor: "#ff8000",
    justifyContent: "center",
    alignItems: "center",
    width: layoutSize.LAYOUT_58,
    height: layoutSize.LAYOUT_58,
  },
  nbSelected: {
    backgroundColor: "#ff8000",
    justifyContent: "center",
    alignItems: "flex-start",
    width: layoutSize.LAYOUT_30,
    height: layoutSize.LAYOUT_58,
  },
  text: {
    color: "#ffffff",
    fontSize: layoutSize.LAYOUT_20,
    fontWeight: "bold",
  },
});
