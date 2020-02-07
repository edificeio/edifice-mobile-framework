import * as React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { EVENT_TYPE } from "../../types";
import { DEVICE_WIDTH, layoutSize } from "../../styles/common/layoutSize";
import { Text } from "../text";
import { Icon } from "..";
import I18n from "i18n-js";
import { CommonStyles } from "../../styles/common/styles";
import { Header } from "react-navigation-stack";

const Item = ({ onEvent, item, navigation, selected, readonly }: any) => {
  const { writeAccess, icon, id, options = {} } = item;
  let disable = (options.monoselection && selected && selected.length !== 1) || (readonly && writeAccess);
  const isFolder = (selected && selected.filter(item => item.isFolder)) || [];

  disable = disable || (isFolder.length && options.onlyFiles);

  if (id === "nbSelected") {
    return (
      <View style={styles.nbSelected}>
        <Text numberOfLines={1} style={styles.nbSelectedText}>
          {selected.length}
        </Text>
      </View>
    );
  }

  if (id === "title") {
    return (
      <View style={styles.textWrapper}>
        <Text numberOfLines={1} style={styles.headerTitleStyle}>
          {navigation.getParam("title") || I18n.t("workspace")}
        </Text>
      </View>
    );
  }

  if (id === "empty") {
    return (
      <View
        style={{
          ...styles.touchPanel,
          backgroundColor: selected && selected.length ? CommonStyles.orangeColorTheme : CommonStyles.mainColorTheme,
        }}></View>
    );
  }

  return (
    <TouchableOpacity
      style={{
        ...styles.touchPanel,
        backgroundColor: selected && selected.length ? CommonStyles.orangeColorTheme : CommonStyles.mainColorTheme,
      }}
      onPress={() => (disable ? null : onEvent && onEvent({ type: EVENT_TYPE.MENU_SELECT, id: item.id, item }))}>
      <Icon color={disable ? "#77777750" : "#ffffff"} size={layoutSize.LAYOUT_24} name={icon} />
    </TouchableOpacity>
  );
};

export default Item;

const styles = StyleSheet.create({
  headerTitleStyle: {
    color: "#ffffff",
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
  },
  nbSelected: {
    backgroundColor: CommonStyles.orangeColorTheme,
    justifyContent: "center",
    alignItems: "flex-start",
    width: layoutSize.LAYOUT_30,
    height: Header.HEIGHT,
  },
  nbSelectedText: {
    color: "#ffffff",
    fontSize: layoutSize.LAYOUT_20,
    fontWeight: "bold",
  },
  textWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    width: DEVICE_WIDTH() - layoutSize.LAYOUT_140,
    height: Header.HEIGHT,
  },
  touchPanel: {
    justifyContent: "center",
    alignItems: "center",
    width: layoutSize.LAYOUT_58,
    height: Header.HEIGHT,
  },
});
