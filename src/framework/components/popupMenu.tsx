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
  button?: (onPress: () => void) => React.ReactElement;
  active?: boolean;
  options: Array<{ icon: string | React.ReactElement; i18n: string; goTo?: NavigationNavigateActionPayload; onClick?: () => void }>;
  onPress?: () => void;
  style?: ViewStyle;
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
    const { iconName, button } = this.props;
    const { active } = this.state;
    const onPress = () => {
      this.setState({ active: !active });
      this.props.onPress?.();
    };
    return (
      <>
        {button ? button(onPress) : <DEPRECATED_HeaderPrimaryAction iconName={active ? 'close' : iconName} onPress={onPress} />}
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
      top: -1000,
      bottom: -1000,
      left: -1000,
      right: -1000,
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
    const { options, style } = this.props;
    const Menu = styled.FlatList({
      position: 'absolute',
      zIndex: 100,
      right: UI_SIZES.spacing.minor,
      top: UI_SIZES.screen.topInset + UI_SIZES.elements.navbarHeight + UI_SIZES.spacing.medium,
      overflow: 'visible',
      ...style,
    });
    return (
      <Menu
        data={options}
        renderItem={({ item }) =>
          this.renderAction(item as { icon: string | React.ReactElement; i18n: string; goTo: NavigationNavigateActionPayload })
        }
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

  renderAction(item: {
    icon: string | React.ReactElement;
    i18n: string;
    goTo?: NavigationNavigateActionPayload;
    onClick: () => void;
  }) {
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
          if (item.goTo) mainNavNavigate(item.goTo.routeName, item.goTo);
          if (item.onClick) item.onClick();
        }}>
        {typeof item.icon === 'string' ? (
          <Icon
            size={26}
            name={item.icon}
            style={{
              paddingHorizontal: UI_SIZES.spacing.small,
            }}
          />
        ) : (
          item.icon
        )}

        <SmallText numberOfLines={1}>{I18n.t(item.i18n)}</SmallText>
      </Action>
    );
  }

  doReset() {
    this.setState({ active: false });
  }
}
