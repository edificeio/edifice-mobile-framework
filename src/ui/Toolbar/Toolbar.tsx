import React, { PureComponent } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Header } from "react-navigation-stack";
import { DEVICE_WIDTH, layoutSize } from "../../styles/common/layoutSize";
import { IFloatingProps, IMenuItem } from "../types";
import { IItem, INavigationProps } from "../../workspace/types";
import Item from "./Item";
import { CommonStyles } from "../../styles/common/styles";

export type ISelected = {
  selected: IItem[];
  readonly?: boolean;
};

class Toolbar extends PureComponent<INavigationProps & IFloatingProps & ISelected, IState> {
  getSections(menuItems: IMenuItem[]) {
    let foundSeparator: boolean | string = false;
    let titleItem: IMenuItem | null = null;
    const firstItems = menuItems.filter(item => {
      if (!foundSeparator && item.id !== "separator" && item.id !== "title") {
        return true;
      }
      foundSeparator = true;
      return false;
    });
    foundSeparator = false;
    const lastItems = menuItems.filter(item => {
      if (item.id === "separator" || item.id === "title") {
        foundSeparator = true;
        if (item.id === "title") titleItem = item;
        return false;
      }
      return foundSeparator;
    });
    return { firstItems, titleItem, lastItems };
  }

  render() {
    const { menuItems } = this.props;

    if (!menuItems || menuItems.length === 0) {
      return null;
    }
    const { onEvent, navigation, readonly, selected } = this.props;
    const { firstItems, titleItem, lastItems } = this.getSections(menuItems);

    return (
      <>
        <FlatList
          contentContainerStyle={{
            ...styles.firstActions,
            backgroundColor: selected && selected.length ? CommonStyles.orangeColorTheme : undefined,
          }}
          data={firstItems}
          horizontal
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item: IMenuItem) => item.id}
          renderItem={({ item }) => (
            <Item item={item} navigation={navigation} selected={selected} onEvent={onEvent ? onEvent : () => null} />
          )}
        />
        {titleItem && (
          <FlatList
            contentContainerStyle={{
              ...styles.middleActions,
              backgroundColor: selected && selected.length ? CommonStyles.orangeColorTheme : undefined,
            }}
            data={[titleItem!]}
            horizontal
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={(item: IMenuItem) => item.id}
            renderItem={({ item }) => <Item item={item} navigation={navigation} />}
          />
        )}
        <FlatList
          contentContainerStyle={{
            ...styles.lastActions,
            backgroundColor: selected && selected.length ? CommonStyles.orangeColorTheme : undefined,
            width: selected && selected.length ? DEVICE_WIDTH() - layoutSize.LAYOUT_70 : layoutSize.LAYOUT_70,
          }}
          data={lastItems}
          horizontal
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item: IMenuItem) => item.id}
          renderItem={({ item }) => (
            <Item
              item={item}
              navigation={navigation}
              selected={selected}
              readonly={readonly}
              onEvent={onEvent ? onEvent : () => null}
            />
          )}
        />
      </>
    );
  }
}

interface IState {}

const styles = StyleSheet.create({
  firstActions: {
    alignItems: "center",
    height: 56,
    justifyContent: "flex-start",
  },
  lastActions: {
    alignItems: "center",
    height: 56,
    justifyContent: "flex-end",
    paddingRight: layoutSize.LAYOUT_16,
  },
  middleActions: {
    alignItems: "center",
    height: 56,
    justifyContent: "space-between",
  },
  separator: {},
});

export default Toolbar;
