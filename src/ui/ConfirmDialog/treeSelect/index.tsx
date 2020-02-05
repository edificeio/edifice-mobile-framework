import React, { Component } from "react";
import { StyleSheet, View, TextInput, FlatList, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { breadthFirstRecursion } from "../utils/menutransform";
import { layoutSize } from "../../../styles/common/layoutSize";
import { IItem } from "../../../workspace/types";
import { ITreeItem } from "../../../workspace/actions/helpers/formatListFolders";
import I18n from "i18n-js";

const styles = StyleSheet.create({
  collapseIcon: {
    width: 0,
    height: 0,
    marginRight: 2,
    borderStyle: "solid",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingBottom: layoutSize.LAYOUT_18,
    backgroundColor: "white",
  },
  textName: {
    fontSize: layoutSize.LAYOUT_14,
    marginLeft: 5,
  },
});

type IProps = {
  data: ITreeItem[];
  defaultSelectedId: string[];
  isOpen: boolean;
  isShowTreeId: boolean;
  itemStyle: any;
  leafCanBeSelected: any;
  onClick: Function;
  onClickLeaf: Function;
  onPress: (event) => void;
  openIds: string[];
  selectedItemStyle: any;
  selectType: any;
  treeNodeStyle: any;
};

type IState = {
  currentNode: any;
  nodesStatus: any;
  searchValue: string;
};

export default class TreeSelect extends React.PureComponent<IProps, IState> {
  routes = [];
  static defaultProps = {
    itemStyle: {
      fontSize: layoutSize.LAYOUT_14,
      color: "#000000",
    },
    openIds: ["owner"],
    selectedItemStyle: {
      backgroundColor: "#2A9CC825",
      fontFamily: "roboto",
      fontSize: layoutSize.LAYOUT_14,
      color: "#000000",
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      nodesStatus: this._initNodesStatus(),
      currentNode: this._initCurrentNode(),
      searchValue: "",
    };
  }

  _initCurrentNode = () => {
    const { defaultSelectedId } = this.props;

    return (defaultSelectedId && defaultSelectedId[0]) || null;
  };

  _initNodesStatus = () => {
    const { isOpen = false, data, openIds = [], defaultSelectedId = [] } = this.props;
    const nodesStatus = new Map();
    if (!isOpen) {
      if (openIds && openIds.length) {
        for (let id of openIds) {
          // eslint-disable-line
          const routes = this._find(data, id);
          routes.map(parent => nodesStatus.set(parent.id, true));
        }
      }
      if (defaultSelectedId && defaultSelectedId.length) {
        for (let id of defaultSelectedId) {
          // eslint-disable-line
          const routes = this._find(data, id);
          routes.map(parent => nodesStatus.set(parent.id, true));
        }
      }
      return nodesStatus;
    }
    breadthFirstRecursion(data).map(item => nodesStatus.set(item.id, true));
    return nodesStatus;
  };

  _find = (data, id) => {
    const stack: IItem[] = [];
    let going = true;

    const walker = (childrenData, innerId) => {
      childrenData.forEach((item: IItem) => {
        if (!going) return;
        stack.push({
          id: item.id,
          name: item.name,
          parentId: item.parentId,
        });
        if (item["id"] === innerId) {
          going = false;
        } else if (item["children"]) {
          walker(item["children"], innerId);
        } else {
          stack.pop();
        }
      });
      if (going) stack.pop();
    };

    walker(data, id);
    return stack;
  };

  _onPressCollapse = ({ e, item }) => {
    // eslint-disable-line
    const { data } = this.props;
    const routes = this._find(data, item.id);
    const currentNodeStatus = this.state.nodesStatus.get(item.id);
    const nodesStatus = new Map();

    routes.forEach(child => nodesStatus.set(child.id, true));
    nodesStatus.set(item.id, !currentNodeStatus);
    nodesStatus.set("owner", true);

    this.setState(
      state => ({
        currentNode: item.id,
        nodesStatus,
      }),
      () => {
        const { onClick } = this.props;
        onClick && onClick({ item, routes, currentNode: this.state.currentNode });
      }
    );
  };

  _onClickLeaf = ({ e, item }) => {
    // eslint-disable-line
    const { onClickLeaf, onClick } = this.props;
    const { data } = this.props;

    this.setState(
      state => ({
        currentNode: item.id,
      }),
      () => {
        const routes = this._find(data, item.id);
        onClick && onClick({ item, routes, currentNode: this.state.currentNode });
        onClickLeaf && onClickLeaf({ item, routes, currentNode: this.state.currentNode });
      }
    );
  };

  _renderTreeNodeIcon = isOpen => {
    const { treeNodeStyle } = this.props;
    const collapseIcon = isOpen
      ? {
          borderRightWidth: 5,
          borderRightColor: "transparent",
          borderLeftWidth: 5,
          borderLeftColor: "transparent",
          borderTopWidth: 10,
          borderTopColor: "black",
        }
      : {
          borderBottomWidth: 5,
          borderBottomColor: "transparent",
          borderTopWidth: 5,
          borderTopColor: "transparent",
          borderLeftWidth: 10,
          borderLeftColor: "black",
        };
    const openIcon = treeNodeStyle && treeNodeStyle.openIcon;
    const closeIcon = treeNodeStyle && treeNodeStyle.closeIcon;

    return openIcon && closeIcon ? (
      <View>{isOpen ? openIcon : closeIcon}</View>
    ) : (
      <View style={[styles.collapseIcon, collapseIcon]} />
    );
  };

  /**
   * Say if a subelement match the filter criteria
   * @param item
   * @returns {RegExpMatchArray | Promise<Response | undefined> | * | boolean}
   */
  matchStackFilter = item => {
    const { searchValue } = this.state;

    if (item.id === "owner") return true;

    return (
      item.name.match(searchValue) ||
      (item.children && item.children.reduce((acc, child) => acc || this.matchStackFilter(child), false))
    );
  };

  /**
   * Set node status to search criteria
   */
  getRootFilters = (searchValue) => {
    const { data } = this.props;
    const nodesStatus = new Map();

    if (searchValue.length) {
      const filteredItems = data.reduce((acc, child) => [...acc, ...this.getFilters(child, searchValue)], []);

      filteredItems.map(item => nodesStatus.set(item.id, true));
    }
    return nodesStatus;
  };

  /**
   * return the set of child items matching search criteria
   * @param item
   * @param searchValue
   * @returns {*[]}
   */
  getFilters = (item, searchValue): any[] => {
    const matchItem = item.name.match(searchValue);
    const subItems = item.children
      ? item.children.reduce((acc, child) => [...acc, ...this.getFilters(child, searchValue)], [])
      : [];

    if (subItems.length > 0 || matchItem) return [item, ...subItems];
    return [];
  };

  _renderRow = ({ item }) => {
    const { currentNode } = this.state;
    const { isShowTreeId = false, selectedItemStyle, itemStyle, leafCanBeSelected } = this.props;
    const { backgroudColor, fontSize, color } = itemStyle && itemStyle;
    const selectedFontSize = selectedItemStyle && selectedItemStyle.fontSize;
    const selectedColor = selectedItemStyle && selectedItemStyle.color;
    const isCurrentNode = currentNode === item.id;

    if (!this.matchStackFilter(item)) return null;

    if (item && item.children && item.children.length) {
      const isOpen = (this.state.nodesStatus && this.state.nodesStatus.get(item && item.id)) || false;
      return (
        <View>
          <TouchableOpacity onPress={e => this._onPressCollapse({ e, item })}>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: isCurrentNode ? "#2A9CC825" : backgroudColor || "#fff",
                marginBottom: 2,
                height: layoutSize.LAYOUT_30,
                alignItems: "center",
              }}>
              {this._renderTreeNodeIcon(isOpen)}
              {isShowTreeId && <Text style={{ fontSize: layoutSize.LAYOUT_14, marginLeft: 4 }}>{item.id}</Text>}
              <Text
                style={[
                  styles.textName,
                  !leafCanBeSelected && isCurrentNode
                    ? { fontSize: selectedFontSize, color: selectedColor }
                    : { fontSize, color },
                ]}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
          {!isOpen ? null : (
            <FlatList
              keyExtractor={(childrenItem, i) => i.toString()}
              style={{ flex: 1, marginLeft: layoutSize.LAYOUT_15 }}
              onEndReachedThreshold={0.01}
              {...this.props}
              data={item.children}
              extraData={this.state}
              renderItem={this._renderRow}
            />
          )}
        </View>
      );
    }
    return (
      <TouchableOpacity onPress={e => this._onClickLeaf({ e, item })}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isCurrentNode ? "#2A9CC825" : backgroudColor || "#fff",
            marginBottom: 2,
            height: 30,
            alignItems: "center",
          }}>
          <Text
            style={[
              styles.textName,
              isCurrentNode ? { fontSize: selectedFontSize, color: selectedColor } : { fontSize, color },
            ]}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  _onSearch = (value) => {
    this.setState({
      nodesStatus: this.getRootFilters(value),
      searchValue: value,
    });
  };

  _renderSearchBar = () => {
    const { searchValue } = this.state;
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: "#cccccc",
          marginRight: layoutSize.LAYOUT_10,
          marginBottom: layoutSize.LAYOUT_10,
          marginTop: -layoutSize.LAYOUT_4,
        }}>
        <TextInput
          style={{
            height: layoutSize.LAYOUT_34,
            fontSize: layoutSize.LAYOUT_14,
            fontFamily: "raboto",
            paddingHorizontal: 5,
            flex: 1,
          }}
          value={searchValue}
          placeholder={I18n.t("Search")}
          placeholderTextColor="#e9e5e1"
          returnKeyType={"search"}
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          autoCorrect={false}
          blurOnSubmit
          clearButtonMode="while-editing"
          onChangeText={text => this._onSearch(text)}
        />
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: layoutSize.LAYOUT_34,
            paddingLeft: layoutSize.LAYOUT_3,
          }}>
          <Ionicons
            name="ios-search"
            style={{ color: "#999999", fontSize: layoutSize.LAYOUT_24, marginHorizontal: 8 }}
          />
        </TouchableOpacity>
      </View>
    );
  };
  render() {
    const { data } = this.props;
    return (
      <View style={styles.container}>
        {this._renderSearchBar()}
        <FlatList
          keyExtractor={(item, i) => i.toString()}
          style={{ flex: 1, marginVertical: 5, paddingHorizontal: 15 }}
          onEndReachedThreshold={0.01}
          {...this.props}
          data={data}
          extraData={this.state}
          renderItem={this._renderRow}
        />
      </View>
    );
  }
}
