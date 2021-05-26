/**
 * Popup Menu
 * Show a drop-down menu from the header
 */

import * as React from "react";
import { ColorValue, ViewStyle } from "react-native";
import { NavigationNavigateActionPayload } from "react-navigation";
import styled from '@emotion/native'

import { Icon } from "../../framework/components/icon";
import theme from "../../framework/theme";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";
import { Text } from "./text";
import I18n from "i18n-js";

export interface IPopupMenuProps {
	iconName: string;
	active?: boolean;
	options: Array<{ icon: string; i18n: string; goTo: NavigationNavigateActionPayload }>
}

interface IPopupMenuState {
	active: boolean;
}

export interface ButtonIconProps {
	name: string; size?: number; style?: ViewStyle; color?: ColorValue;
	onPress: () => void | Promise<void>;
}

export const getButtonShadow = () => ({
	elevation: 5,
	shadowColor: theme.color.shadowColor,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.25,
	shadowRadius: 3.8
});

export const getMenuShadow = () => ({
	elevation: 5,
	shadowColor: theme.color.shadowColor,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.25,
	shadowRadius: 3.8,
});

export const buttonStyle: ViewStyle = {
	alignItems: "center",
	justifyContent: "center",
	width: 50,
	height: 50,
	borderRadius: 50 / 2,
	backgroundColor: theme.color.primary.regular,
	...getButtonShadow() as ViewStyle
}

export const ButtonIcon = ({ name, onPress, size, style, color }: ButtonIconProps) => {
	if (color === undefined) color = "white";
	const Button = styled.TouchableOpacity({ ...buttonStyle, ...style });
	return (
		<Button onPress={onPress} style={{ ...buttonStyle, ...style }}>
			<Icon color={color} size={size || 24} name={name} />
		</Button>
	);
};

export default class PopupMenu extends React.PureComponent<IPopupMenuProps, IPopupMenuState> {
	constructor(props: IPopupMenuProps) {
		super(props);
		this.state = {
			active: this.props.active || false
		}
	}

	render() {
		return <>
			<ButtonIcon name={this.props.iconName} onPress={() => {
				this.setState({ active: !this.state.active })
			}}
				style={{
					position: "absolute",
					right: 20, top: -38, zIndex: 100
				}} />
			{this.state.active ? <>
				{this.renderOverlay()}
				{this.renderOptions()}
			</> : null}
		</>;
	}

	renderOverlay() {
		const Overlay = styled.TouchableOpacity({
			position: "absolute", zIndex: 99,
			top: 0, bottom:0, left: 0, right: 0,
		});
		return <Overlay onPress={() => { this.doReset() }}/>
	}

	renderOptions() {
		const Menu = styled.FlatList({
			position: "absolute", zIndex: 100,
			right: 20, top: 18,
			overflow: "visible",
		})
		return <Menu
			data={this.props.options}
			renderItem={({ item }) => this.renderAction(item as { icon: string; i18n: string; goTo: NavigationNavigateActionPayload })}
			contentContainerStyle={{
				borderRadius: 4,
				backgroundColor: theme.color.cardBackground,
				width: 200,
				overflow: "visible",
				...getMenuShadow()
			} as ViewStyle}
			alwaysBounceVertical={false}
		/>;
	}

	renderAction(item: { icon: string; i18n: string; goTo: NavigationNavigateActionPayload }) {
		const Action = styled.TouchableOpacity({
			flexDirection: "row", justifyContent: "flex-start", alignItems: "center",
			flex: 1,
			paddingVertical: 12,
		});

		return <Action
			onPress={() => {
				this.doReset();
				mainNavNavigate(item.goTo.routeName, item.goTo);
			}}
		>
			<Icon color={theme.color.text.heavy} size={26} name={item.icon} style={{
				paddingHorizontal: 12
			}}/>
			<Text numberOfLines={1} style={{ color: theme.color.text.heavy}}>{I18n.t(item.i18n)}</Text>
		</Action>
	}

	doReset() {
		this.setState({ active: false });
	}
}
