import * as React from "react"
import { Text } from "react-native"
import { NavigationActions, StackNavigator, TabNavigator } from "react-navigation"
import { IconOnOff } from "../components"
import { CommonStyles } from "../components/styles/common/styles"
import { layoutSize } from "../constants/layoutSize"
import { navigatorRef } from "../components/AppScreen"

export const navigator = routes =>
	TabNavigator(routes, {
		backBehavior: "none",
		swipeEnabled: true,
		tabBarPosition: "bottom",
		tabBarOptions: {
			activeTintColor: CommonStyles.mainColorTheme,
			inactiveTintColor: CommonStyles.mainColorTheme,
			labelStyle: {
				fontSize: layoutSize.LAYOUT_12,
				color: CommonStyles.textTabBottomColor,
			},
			style: {
				backgroundColor: CommonStyles.tabBottomColor,
				borderTopWidth: 1,
				borderTopColor: CommonStyles.borderColorLighter,
				elevation: 1,
			},
			indicatorStyle: {
				backgroundColor: "#ffffff", //hidden
			},
			showLabel: true,
			upperCaseLabel: false,
			showIcon: true,
		},
	})

export const stackNavigator = route =>
	StackNavigator(route, {
		navigationOptions: {
			headerStyle: {
				backgroundColor: CommonStyles.mainColorTheme,
				borderBottomWidth: 0, //removes border on iOS
				elevation: 0, //removes shadow on android
			},
			headerTitleStyle: {
				color: "white",
				alignSelf: "center",
				textAlign: "center",
			},
			headerTintColor: CommonStyles.mainColorTheme,
		},
	})

export const NestedTabNavigator = routes =>
	TabNavigator(routes, {
		backBehavior: "none",
		swipeEnabled: true,
		tabBarPosition: "top",
		tabBarOptions: {
			labelStyle: {
				fontSize: layoutSize.LAYOUT_13,
			},
			style: {
				backgroundColor: CommonStyles.tabBackgroundColor,
			},
			indicatorStyle: {
				backgroundColor: CommonStyles.selectColor,
			},
			showLabel: false,
			showIcon: true,
		},
	})

/**
 * return a navigationOptionsTitle object fill with its attributes
 * @param title      the title of the navigationOptionsTitle
 * @param iconName   the icon name
 */
export const navRootOptions = (title, iconName) => ({
	tabBarLabel: ({ focused }) => (
		<Text style={{ color: focused ? CommonStyles.actionColor : CommonStyles.textTabBottomColor }}>{title}</Text>
	),
	tabBarIcon: ({ focused }) => <IconOnOff name={iconName} focused={focused} />,
})

export const navOptions = props => {
	return {
		...props,
		headerStyle: {
			backgroundColor: CommonStyles.mainColorTheme,
		},
		headerTitleStyle: {
			color: "white",
			alignSelf: "center",
			textAlign: "center",
			fontSize: layoutSize.LAYOUT_16
		},
	}
}

export const navigate = (route, props = {}) => {
	return navigatorRef.dispatch(NavigationActions.navigate({ routeName: route, params: props }))
}
