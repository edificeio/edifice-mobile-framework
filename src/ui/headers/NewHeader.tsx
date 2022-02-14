import * as React from 'react';
import { Platform, ViewStyle, View } from 'react-native';
import { NavigationScreenProp, NavigationActions } from 'react-navigation';

import { UI_SIZES } from '~/framework/components/constants';
import { Text } from '~/framework/components/text';
import { CommonStyles } from '~/styles/common/styles';
import { Icon } from '~/ui';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

// HEADER ICON
const HeaderIconStyle: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  height: UI_SIZES.headerHeight,
  width: 60,
  flex: 0,
};

const iconsDeltaSizes = {
  close: 16,
};

export interface IHeaderIconProps {
  name: string | null;
  hidden?: boolean;
  iconSize?: number;
  primary?: boolean;
}
export const HeaderIcon = ({ name, hidden, iconSize, primary }: IHeaderIconProps) => (
  <View
    style={[
      HeaderIconStyle,
      primary && {
        backgroundColor: CommonStyles.secondary,
        borderRadius: 30,
        height: 50,
        width: 50,
        marginTop: 20,
        marginRight: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    ]}>
    <Icon
      size={iconSize || (iconsDeltaSizes as { [key: string]: number })[name] || 20}
      name={name}
      color={hidden ? 'transparent' : '#FFFFFF'}
    />
  </View>
);

// Use this in place React Navigation Back implementation.
export const HeaderBackAction = ({ navigation, style }: { navigation: NavigationScreenProp<object>; style?: ViewStyle }) => (
  <HeaderAction
    onPress={() => navigation.dispatch(NavigationActions.back())}
    name={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
    iconSize={24}
    style={style}
  />
);

// HEADER TEXTS
const HeaderActionText = (props: { [prop: string]: any }) => (
  <View
    style={{
      paddingHorizontal: 18,
      height: UI_SIZES.headerHeight,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text style={{ color: 'white' }} {...props} />
  </View>
);

// HEADER ACTION
export class HeaderAction extends React.PureComponent<{
  customComponent?: JSX.Element;
  name?: string;
  hidden?: boolean;
  iconSize?: number;
  title?: string;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  primary?: boolean;
}> {
  render() {
    const { customComponent, name, hidden, onPress, iconSize, title, style, disabled = false, primary } = this.props;
    const ActionComponent = disabled ? View : TouchableOpacity;
    return (
      <ActionComponent
        onPress={() => !disabled && onPress && onPress()}
        style={{ ...(disabled ? { opacity: 0.7 } : {}), ...style }}>
        {customComponent || null}
        {name ? <HeaderIcon name={name} hidden={hidden} iconSize={iconSize} primary={primary} /> : undefined}
        {title ? <HeaderActionText>{title}</HeaderActionText> : undefined}
      </ActionComponent>
    );
  }
}
