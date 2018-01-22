import style from "glamorous-native"
import * as React from "react"
import { NavigationActions, StackNavigator, TabNavigator } from "react-navigation"
import { IconOnOff } from "../components"
import { navigatorRef } from "../components/AppScreen"
import { CommonStyles } from "../components/styles/common/styles"
import { TabBarBottomKeyboardAward } from "../components/ui/TabBarComponent"
import { layoutSize } from "../constants/layoutSize"

export const navigator = routes =>
	TabNavigator(routes, {
		tabBarComponent: TabBarBottomKeyboardAward,
		swipeEnabled: true,
		tabBarPosition: "bottom",
		tabBarOptions: {
			activeTintColor: CommonStyles.mainColorTheme,
			inactiveTintColor: CommonStyles.mainColorTheme,
			labelStyle: {
				fontSize: layoutSize.LAYOUT_12,
				fontFamily: CommonStyles.primaryFontFamily,
				color: CommonStyles.textTabBottomColor,
			},
			style: {
				backgroundColor: CommonStyles.tabBottomColor,
				borderTopWidth: 1,
				borderTopColor: CommonStyles.borderColorLighter,
				height: layoutSize.LAYOUT_50,
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

const customAnimationFunc = () => ({
	screenInterpolator: () => {
		return null
	},
})

export const stackNavigator = route =>
	StackNavigator(route, {
		navigationOptions: {
			headerTintColor: CommonStyles.mainColorTheme,
		},
		transitionConfig: customAnimationFunc,
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

const TabBarLbel = style.text(
	{
		alignSelf: "center",
		fontSize: layoutSize.LAYOUT_12,
		fontFamily: CommonStyles.primaryFontFamily,
		marginBottom: layoutSize.LAYOUT_4,
	},
	({ focused }) => ({
		color: focused ? CommonStyles.actionColor : CommonStyles.textTabBottomColor,
	})
)

/**
 * return a navigationOptionsTitle object fill with its attributes
 * @param title      the title of the navigationOptionsTitle
 * @param iconName   the icon name
 */
export const navRootOptions = (title, iconName) => ({
	tabBarLabel: ({ focused }) => <TabBarLbel focused={focused}>{title}</TabBarLbel>,
	tabBarIcon: ({ focused }) => <IconOnOff name={iconName} focused={focused} />,
	tabBarOptions: {
		labelStyle: {
			fontSize: layoutSize.LAYOUT_10,
			fontFamily: CommonStyles.primaryFontFamily,
			color: CommonStyles.textTabBottomColor,
		},
	},
})

export const navOptions = props => {
	return {
		headerStyle: {
			backgroundColor: CommonStyles.mainColorTheme,
			paddingHorizontal: layoutSize.LAYOUT_20,
		},
		headerTitleStyle: {
			color: "white",
			alignSelf: "center",
			textAlign: "center",
			fontWeight: "400",
			fontFamily: CommonStyles.primaryFontFamily,
			fontSize: layoutSize.LAYOUT_16,
		},
		...props,
	}
}

export const navigate = (route, props = {}) => {
	return navigatorRef.dispatch(NavigationActions.navigate({ routeName: route, params: props }))
}
