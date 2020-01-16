import React, { Component } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Header } from "react-navigation-stack";
import ToolbarActionItem from "./ToolbarActionItem";
import { DEVICE_WIDTH, layoutSize } from "../../styles/common/layoutSize";
import { IFloatingProps, IMenuItem } from "../types";

export type INbSelected = {
  nbSelected: number;
};

class Toolbar extends Component<IFloatingProps & INbSelected, IState> {
  state = {
    active: false,
  };

  visible = true;

  getShadow = () => {
    return {
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 5,
        height: 8,
      },
      shadowOpacity: 0.45,
      shadowRadius: 3.84,
    };
  };

  renderActions(menuItems: IMenuItem[]) {
    const { onEvent } = this.props;
    let foundSeparator = false;
    const firstItems = menuItems.filter(item => {
      if (!foundSeparator && item.id !== "separator") {
        return true;
      }
      foundSeparator = true;
      return false;
    });
    foundSeparator = false;
    const lastItems = menuItems.filter(item => {
      if (item.id === "separator") {
        foundSeparator = true;
        return false;
      }
      return foundSeparator;
    });

    return (
      <View style={styles.overlay}>
        <FlatList
          contentContainerStyle={styles.firstActions}
          data={firstItems}
          horizontal={true}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item: IMenuItem) => item.id}
          renderItem={({ item }) => (
            <ToolbarActionItem
              item={item}
              nbSelected={this.props.nbSelected}
              onEvent={onEvent ? onEvent : () => null}
            />
          )}
        />
        <FlatList
          contentContainerStyle={styles.lastActions}
          data={lastItems}
          horizontal={true}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyExtractor={(item: IMenuItem) => item.id}
          renderItem={({ item }) => (
            <ToolbarActionItem
              item={item}
              nbSelected={this.props.nbSelected}
              onEvent={onEvent ? onEvent : () => null}
            />
          )}
        />
      </View>
    );
  }

  render() {
    const { menuItems, nbSelected } = this.props;

    if (!menuItems || menuItems.length === 0 || !nbSelected) {
      return null;
    }

    return this.renderActions(menuItems);
  }
}

interface IState {
  active: boolean;
}

const styles = StyleSheet.create({
  firstActions: {
    backgroundColor: "#ff8000",
    justifyContent: "flex-start",
    width: layoutSize.LAYOUT_70,
    height: Header.HEIGHT,
  },
  lastActions: {
    backgroundColor: "#ff8000",
    justifyContent: "flex-end",
    width: DEVICE_WIDTH() - layoutSize.LAYOUT_70,
    height: Header.HEIGHT,
  },
  overlay: {
    elevation: 15,
    left: 0,
    position: "absolute",
    flex: 1,
    flexDirection: "row",
    top: -Header.HEIGHT,
    width: DEVICE_WIDTH(),
    height: Header.HEIGHT,
    zIndex: 15,
  },
  separatorPanel: {
    backgroundColor: "#ff8000",
    width: 0,
    height: Header.HEIGHT,
  },
  separator: {},
});

export default Toolbar;
