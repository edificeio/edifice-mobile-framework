import styled from '@emotion/native';
import * as React from 'react';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { DEPRECATED_HeaderPrimaryAction } from '~/framework/components/header';
import { TextBold } from '~/framework/components/text';
import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { IFloatingProps, IMenuItem } from '~/ui/types';

import FloatingActionItem from './FloatingButton/FloatingActionItem';
import { ISelected } from './Toolbar/Toolbar';
import { Icon } from './icons/Icon';

export interface ButtonTextIconProps {
  onPress: () => any;
  children?: any;
  disabled?: boolean;
  name: string;
  size?: number;
  style?: any;
  whiteSpace?: string;
  color?: string;
  colorText?: string;
}

const styles = StyleSheet.create({
  buttonWithShadow: {
    ...getButtonShadow(),
  },
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

const Container = styled.View({
  alignItems: 'center',
  justifyContent: 'space-evenly',
});

const TouchableOpacity = styled.TouchableOpacity({
  alignItems: 'center',
  justifyContent: 'center',
  width: layoutSize.LAYOUT_50,
  height: layoutSize.LAYOUT_50,
  borderRadius: layoutSize.LAYOUT_25,
  backgroundColor: theme.palette.secondary.regular,
});

export const ButtonIconText = ({ style, children, colorText, ...rest }: ButtonTextIconProps) => {
  if (colorText === undefined) colorText = 'black';
  return (
    <Container>
      <ButtonIcon {...rest} style={[styles.buttonWithShadow, style]} />
      <TextBold style={{ color: colorText, fontSize: 15 }}>{children}</TextBold>
    </Container>
  );
};

export const ButtonIcon = ({ name, onPress, children, size, style, color }: ButtonTextIconProps) => {
  if (color === undefined) color = 'white';
  return (
    <TouchableOpacity onPress={onPress} style={[styles.buttonWithShadow, style]}>
      <Icon color={color} size={size ? size : layoutSize.LAYOUT_25} name={name} />
    </TouchableOpacity>
  );
};

export function getButtonShadow() {
  return {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
  };
}

export function getMenuShadow() {
  return {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.8,
  };
}

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
