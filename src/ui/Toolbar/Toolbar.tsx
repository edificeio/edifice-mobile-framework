import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import Item from './Item';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { DEVICE_WIDTH, layoutSize } from '~/styles/common/layoutSize';
import { IFloatingProps, IMenuItem } from '~/ui/types';
import { IItem, INavigationProps } from '~/workspace/types';

export type ISelected = {
  selected?: IItem[];
  readonly?: boolean;
};

class Toolbar extends PureComponent<INavigationProps & IFloatingProps & ISelected, IState> {
  getSections(menuItems: IMenuItem[]) {
    let foundSeparator: boolean | string = false;
    let titleItem: IMenuItem | null = null;
    const firstItems = menuItems.filter(item => {
      if (!foundSeparator && item.id !== 'separator' && item.id !== 'title') {
        return true;
      }
      foundSeparator = true;
      return false;
    });
    foundSeparator = false;
    const lastItems = menuItems.filter(item => {
      if (item.id === 'separator' || item.id === 'title') {
        foundSeparator = true;
        if (item.id === 'title') titleItem = item;
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
            backgroundColor: selected && selected.length ? theme.color.primary.regular : undefined,
          }}
          data={firstItems}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View />}
          keyExtractor={(item: IMenuItem) => item.id}
          renderItem={({ item }) => (
            <Item item={item} navigation={navigation} selected={selected} onEvent={onEvent ? onEvent : () => null} />
          )}
        />
        {titleItem && (
          <FlatList
            contentContainerStyle={{
              ...styles.middleActions,
              backgroundColor: selected && selected.length ? theme.color.primary.regular : undefined,
            }}
            data={[titleItem!]}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View />}
            keyExtractor={(item: IMenuItem) => item.id}
            renderItem={({ item }) => <Item item={item} navigation={navigation} />}
          />
        )}
        <FlatList
          contentContainerStyle={{
            ...styles.lastActions,
            backgroundColor: selected && selected.length ? theme.color.primary.regular : undefined,
            width: selected && selected.length ? DEVICE_WIDTH() - layoutSize.LAYOUT_70 : layoutSize.LAYOUT_70,
          }}
          data={lastItems}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View />}
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
    alignItems: 'center',
    height: UI_SIZES.headerHeight,
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  middleActions: {
    alignItems: 'center',
    height: UI_SIZES.headerHeight,
    justifyContent: 'space-between',
  },
  lastActions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: UI_SIZES.headerHeight,
    justifyContent: 'flex-end',
    paddingRight: layoutSize.LAYOUT_16,
  },
});

export default Toolbar;
