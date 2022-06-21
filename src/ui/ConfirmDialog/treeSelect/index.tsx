import I18n from 'i18n-js';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { DEVICE_HEIGHT, layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { ITreeItem } from '~/workspace/actions/helpers/formatListFolders';
import { IItem } from '~/workspace/types';
import { IFile } from '~/workspace/types/states/items';

type IProps = {
  data: ITreeItem[];
  defaultSelectedId: string[];
  excludeData: IFile[];
  isShowTreeId?: boolean;
  leafCanBeSelected?: any;
  onClick?: Function;
  openIds: string[];
  selectType?: any;
  treeNodeStyle?: any;
};

export default function TreeSelect({
  data,
  defaultSelectedId = ['owner'],
  excludeData = [],
  onClick = f => f,
  openIds = ['owner'],
}: IProps) {
  const [currentNode, setCurrentNode] = useState(_initCurrentNode(defaultSelectedId));
  const [nodesStatus, setNodesStatus] = useState(_initNodesStatus(data, openIds, defaultSelectedId));
  const [searchValue, setSearchValue] = useState('');
  const selectedColor = '#000000';

  function _initCurrentNode(defaultSelectedId) {
    if (!defaultSelectedId.length) {
      return 'owner';
    }
    for (const id of defaultSelectedId) {
      const routes = _find(data, id);

      if (routes.length === 0) {
        return 'owner';
      }
    }
    return defaultSelectedId[0];
  }

  function _initNodesStatus(data, openIds = ['owner'] as string[], defaultSelectedId = ['owner'] as string[]) {
    const nodesStatus = {};

    if (openIds && openIds.length) {
      for (const id of openIds) {
        const routes = _find(data, id);
        routes.forEach(parent => (nodesStatus[parent.id] = true));
      }
    }
    if (defaultSelectedId && defaultSelectedId.length) {
      for (const id of defaultSelectedId) {
        let routes = _find(data, id);

        if (routes.length === 0) routes = _find(data, 'owner');
        routes.forEach(parent => (nodesStatus[parent.id] = true));
      }
    }
    return nodesStatus;
  }

  function _find(data, id) {
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
        if (item['id'] === innerId) {
          going = false;
        } else if (item['children']) {
          walker(item['children'], innerId);
        } else {
          stack.pop();
        }
      });
      if (going) stack.pop();
    };

    walker(data, id);
    return stack;
  }

  const _onClick = ({ item, isParentOfSelection }) => {
    const currentNodeStatus = nodesStatus[item.id];

    nodesStatus[item.id] = !currentNodeStatus;

    setNodesStatus(nodesStatus);
    setCurrentNode(item.id);
    onClick(item.id, isParentOfSelection);
  };

  const _renderTreeNodeIcon = isOpen => {
    const treeNodeStyle = {
      openIcon: <Icon size={layoutSize.LAYOUT_24} color={CommonStyles.orangeColorTheme} name="menu-down" />,
      closeIcon: <Icon size={layoutSize.LAYOUT_24} color={CommonStyles.orangeColorTheme} name="menu-right" />,
    };
    const collapseIcon = isOpen
      ? {
          borderRightWidth: 5,
          borderRightColor: 'transparent',
          borderLeftWidth: 5,
          borderLeftColor: 'transparent',
          borderTopWidth: 10,
          borderTopColor: 'black',
        }
      : {
          borderBottomWidth: 5,
          borderBottomColor: 'transparent',
          borderTopWidth: 5,
          borderTopColor: 'transparent',
          borderLeftWidth: 10,
          borderLeftColor: 'black',
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
   * Say if a subelement match the filter criteria,
   * if yes open the parent
   * @param item
   * @returns {RegExpMatchArray | Promise<Response | undefined> | * | boolean}
   */
  const matchStackFilter = item => {
    if (!searchValue || searchValue.length === 0) return true;

    if (item.id === 'owner') return true;

    return (
      item.name.toLowerCase().match(searchValue) ||
      (item.children && item.children.reduce((acc, child) => acc || matchStackFilter(child), false))
    );
  };

  /**
   * Set node status according search criteria
   */
  const calculateNodesStatus = searchValue => {
    const nodesStatus = {};

    if (searchValue.length) {
      const filteredItems = data.reduce((acc, child) => [...acc, ..._getFilters(child, searchValue)], [] as ITreeItem[]);

      filteredItems.forEach(item => (nodesStatus[item.id] = true));
    }
    return nodesStatus;
  };

  /**
   * return the set of child items matching search criteria
   * @param item
   * @param searchValue
   * @returns {*[]}
   */
  const _getFilters = (item: ITreeItem, searchValue: string): ITreeItem[] => {
    const matchItem = item.name.toLowerCase().match(searchValue);
    const subItems = item.children
      ? item.children.reduce((acc, child) => [...acc, ..._getFilters(child, searchValue)], [] as ITreeItem[])
      : [];

    if (subItems.length > 0 || matchItem) return [item, ...subItems];
    return [];
  };

  const _renderRow = ({ item }) => {
    const backgroundColor = theme.ui.background.card,
      fontSize = layoutSize.LAYOUT_14,
      color = '#000000',
      selectedFontSize = layoutSize.LAYOUT_14,
      isCurrentNode = currentNode === item.id;
    const parentIdOfSelection = _initCurrentNode(defaultSelectedId);
    const isParentOfSelection = parentIdOfSelection === item.id;
    const selectedFolders = excludeData.filter(exclude => exclude.isFolder);
    const allFoldersSelected = item.children.length === selectedFolders.length;

    if (!matchStackFilter(item) || excludeData.filter(exclude => item.id === exclude.id).length) return null;

    if (item && item.children && item.children.length && !(isParentOfSelection && allFoldersSelected)) {
      const isOpen = nodesStatus[item.id] || false;
      return (
        <View>
          <TouchableOpacity onPress={() => _onClick({ item, isParentOfSelection })}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: isCurrentNode ? '#2A9CC825' : backgroundColor || '#fff',
                marginBottom: 2,
                height: layoutSize.LAYOUT_30,
                alignItems: 'center',
              }}>
              {_renderTreeNodeIcon(isOpen)}
              <Text
                style={[
                  styles.textName,
                  isCurrentNode ? { fontSize: selectedFontSize, color: selectedColor } : { fontSize, color },
                ]}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
          {isOpen && (
            <FlatList
              keyExtractor={(childrenItem, i) => i.toString()}
              style={{ flex: 1, marginLeft: layoutSize.LAYOUT_15 }}
              onEndReachedThreshold={0.01}
              data={item.children.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))}
              renderItem={_renderRow}
            />
          )}
        </View>
      );
    }
    return (
      <TouchableOpacity onPress={e => _onClick({ item, isParentOfSelection })}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: isCurrentNode ? '#2A9CC825' : backgroundColor || theme.ui.background.card,
            marginBottom: 2,
            height: 30,
            alignItems: 'center',
          }}>
          <Text
            style={[styles.textName, isCurrentNode ? { fontSize: selectedFontSize, color: selectedColor } : { fontSize, color }]}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const _onSearch = value => {
    setNodesStatus(calculateNodesStatus(value));
    setSearchValue(value);
  };

  const _renderSearchBar = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderColor: '#cccccc',
          marginRight: layoutSize.LAYOUT_10,
          marginBottom: layoutSize.LAYOUT_10,
          marginTop: -layoutSize.LAYOUT_4,
        }}>
        <TextInput
          style={{
            height: layoutSize.LAYOUT_40,
            fontSize: layoutSize.LAYOUT_15,
            paddingHorizontal: 5,
            flex: 1,
          }}
          value={searchValue}
          placeholder={I18n.t('Search')}
          placeholderTextColor="#e9e5e1"
          returnKeyType="search"
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          autoCorrect={false}
          spellCheck={false}
          blurOnSubmit
          clearButtonMode="while-editing"
          onChangeText={text => _onSearch(text)}
        />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: layoutSize.LAYOUT_34,
            paddingLeft: layoutSize.LAYOUT_3,
          }}>
          <Icon name="search2" style={{ color: '#999999', fontSize: layoutSize.LAYOUT_24, marginHorizontal: 8 }} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {_renderSearchBar()}
      <FlatList
        keyExtractor={(item, i) => i.toString()}
        style={styles.flatList}
        onEndReachedThreshold={0.01}
        data={data}
        renderItem={_renderRow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  collapseIcon: {
    width: 0,
    height: 0,
    marginRight: 2,
    borderStyle: 'solid',
  },
  container: {
    flexGrow: 0,
    backgroundColor: theme.ui.background.card,
  },
  contentContainer: {
    paddingBottom: layoutSize.LAYOUT_18,
    backgroundColor: theme.ui.background.card,
  },
  flatList: {
    flexGrow: 0,
    marginVertical: 5,
    maxHeight: DEVICE_HEIGHT() - layoutSize.LAYOUT_250,
    marginTop: layoutSize.LAYOUT_10,
    marginBottom: layoutSize.LAYOUT_10,
    paddingHorizontal: 15,
  },
  textName: {
    fontSize: layoutSize.LAYOUT_14,
    marginLeft: 5,
  },
});
