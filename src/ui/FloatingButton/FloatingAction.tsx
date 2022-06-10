import React from 'react';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { DEPRECATED_HeaderPrimaryAction } from '~/framework/components/header';
import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { getMenuShadow } from '~/ui/ButtonIconText';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { ISelected } from '~/ui/Toolbar/Toolbar';
import { IFloatingProps, IMenuItem } from '~/ui/types';

import FloatingActionItem from './FloatingActionItem';

const styles = StyleSheet.create({
  actions: {
    borderRadius: layoutSize.LAYOUT_4,
    overflow: 'visible',
    backgroundColor: '#ffffff',
    position: 'absolute',
    right: 12,
    top: 78,
    width: layoutSize.LAYOUT_200,
    zIndex: 10,
    ...getMenuShadow(),
  },
  button: {
    position: 'absolute',
    right: 20,
    top: UI_SIZES.screen.topInset,
    zIndex: 10,
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

interface IState {
  active: boolean;
}
export default class FloatingAction extends React.Component<IFloatingProps & ISelected, IState> {
  state = {
    active: false,
  };

  visible = true;

  reset = () => {
    this.setState({
      active: false,
    });
  };

  animateButton = () => {
    const { active } = this.state;

    Keyboard.dismiss();

    if (!active) {
      this.setState({
        active: true,
      });
    } else {
      this.reset();
    }
  };

  handleEvent = (event: any): void => {
    const { onEvent } = this.props;

    if (onEvent) {
      onEvent(event);
    }
    this.reset();
  };

  renderMainButton() {
    const { menuItems } = this.props;
    const iconName = this.state.active ? 'close' : 'add';

    if (!menuItems || menuItems.length === 0) {
      return null;
    }

    return <DEPRECATED_HeaderPrimaryAction iconName={iconName} onPress={this.animateButton} />;
  }

  renderActions() {
    const { menuItems } = this.props;
    const { active } = this.state;

    if (!active || !menuItems || menuItems.length === 0) {
      return undefined;
    }

    return (
      <FlatList
        contentContainerStyle={styles.actions}
        data={menuItems}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item: IMenuItem) => item.id}
        renderItem={({ item }) => (
          <FloatingActionItem eventHandleData={this.props.eventHandleData} item={item} onEvent={this.handleEvent.bind(this)} />
        )}
      />
    );
  }

  render() {
    const { selected } = this.props;

    if (selected?.length) {
      return null;
    }

    const { menuItems } = this.props;
    const { active } = this.state;

    if (active) {
      return (
        <>
          {this.renderMainButton()}
          <TouchableOpacity onPress={this.animateButton} style={styles.overlayActions}>
            {this.renderActions()}
          </TouchableOpacity>
        </>
      );
    }

    if (!active || (menuItems && menuItems.length === 0)) {
      return this.renderMainButton();
    }

    return null;
  }
}
