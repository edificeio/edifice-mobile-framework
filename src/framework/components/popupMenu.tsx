/**
 * Popup Menu
 * Show a drop-down menu from the header
 */
import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, ViewStyle } from 'react-native';
import { hasNotch } from 'react-native-device-info';
import { NavigationNavigateActionPayload } from 'react-navigation';

import theme from '~/app/theme';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';

import { UI_SIZES } from './constants';
import { DEPRECATED_HeaderPrimaryAction } from './header';
import { Icon } from './icon';
import { SmallText } from './text';

export interface IPopupMenuProps {
  iconName: string;
  active?: boolean;
  options: Array<{ icon: string; i18n: string; goTo: NavigationNavigateActionPayload }>;
  onPress?: () => void;
}

interface IPopupMenuState {
  active: boolean;
}

export const getMenuShadow = () => ({
  elevation: 5,
  shadowColor: theme.ui.shadowColor,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.8,
});

export default class PopupMenu extends React.PureComponent<IPopupMenuProps, IPopupMenuState> {
  constructor(props: IPopupMenuProps) {
    super(props);
    this.state = {
      active: this.props.active || false,
    };
  }

  render() {
    const { iconName } = this.props;
    const { active } = this.state;
    return (
      <>
        <DEPRECATED_HeaderPrimaryAction
          iconName={active ? 'close' : iconName}
          onPress={() => {
            this.setState({ active: !active });
            this.props.onPress?.();
          }}
        />
        {active ? (
          <>
            {this.renderOverlay()}
            {this.renderOptions()}
          </>
        ) : null}
      </>
    );
  }

  renderOverlay() {
    const Overlay = styled.TouchableOpacity({
      position: 'absolute',
      zIndex: 99,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
    return (
      <Overlay
        onPress={() => {
          this.doReset();
        }}
      />
    );
  }

  renderOptions() {
    const { options } = this.props;
    const Menu = styled.FlatList({
      position: 'absolute',
      zIndex: 100,
      right: 20,
      top: Platform.select({ android: 70, ios: hasNotch() ? 117 : 90 }),
      overflow: 'visible',
    });
    return (
      <Menu
        data={options}
        renderItem={({ item }) => this.renderAction(item as { icon: string; i18n: string; goTo: NavigationNavigateActionPayload })}
        contentContainerStyle={
          {
            borderRadius: 4,
            backgroundColor: theme.ui.background.card,
            width: 200,
            overflow: 'visible',
            ...getMenuShadow(),
          } as ViewStyle
        }
        alwaysBounceVertical={false}
        overScrollMode="never"
      />
    );
  }

  renderAction(item: { icon: string; i18n: string; goTo: NavigationNavigateActionPayload }) {
    const Action = styled.TouchableOpacity({
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flex: 1,
      paddingVertical: UI_SIZES.spacing.small,
    });

    return (
      <Action
        onPress={() => {
          this.doReset();
          mainNavNavigate(item.goTo.routeName, item.goTo);
        }}>
        <Icon
          size={26}
          name={item.icon}
          style={{
            paddingHorizontal: UI_SIZES.spacing.small,
          }}
        />
        <SmallText numberOfLines={1}>{I18n.t(item.i18n)}</SmallText>
      </Action>
    );
  }

  doReset() {
    this.setState({ active: false });
  }
}
