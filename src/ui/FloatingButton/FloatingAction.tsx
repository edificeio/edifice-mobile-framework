import React, { useState } from 'react';
import { FlatList, Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { DEPRECATED_HeaderPrimaryAction } from '~/framework/components/header';
import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { getMenuShadow } from '~/ui/ButtonIconText';
import { IFloatingProps, IMenuItem } from '~/ui/types';

import FloatingActionItem from './FloatingActionItem';

const styles = StyleSheet.create({
  actions: {
    borderRadius: layoutSize.LAYOUT_4,
    overflow: 'visible',
    backgroundColor: theme.palette.grey.white,
    position: 'absolute',
    right: 12,
    top: 78,
    width: layoutSize.LAYOUT_200,
    zIndex: 10,
    ...getMenuShadow(),
  },
  overlayActions: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: UI_SIZES.screen.topInset,
  },
  separator: {
    borderBottomColor: CommonStyles.borderColorVeryLighter,
    borderBottomWidth: 1,
    width: '100%',
  },
});

export const FloatingAction = (props: IFloatingProps) => {
  const [isActive, setActive] = useState<boolean>(false);

  const showActions = () => {
    Keyboard.dismiss();
    setActive(!isActive);
  };

  const handleEvent = (event: any): void => {
    setActive(false);
    if (props.onEvent) {
      props.onEvent(event);
    }
  };

  return (
    <>
      <DEPRECATED_HeaderPrimaryAction iconName={isActive ? 'close' : 'add'} onPress={showActions} />
      {isActive ? (
        <TouchableOpacity activeOpacity={1} onPress={showActions} style={styles.overlayActions}>
          <FlatList
            contentContainerStyle={styles.actions}
            data={props.menuItems}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={(item: IMenuItem) => item.id}
            renderItem={({ item }) => (
              <FloatingActionItem eventHandleData={props.eventHandleData} item={item} onEvent={handleEvent} />
            )}
          />
        </TouchableOpacity>
      ) : null}
    </>
  );
};
