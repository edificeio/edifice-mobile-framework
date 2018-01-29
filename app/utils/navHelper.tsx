import style from "glamorous-native"
import * as React from "react"
import { NavigationActions, StackNavigator, TabNavigator } from "react-navigation"
import { IconOnOff } from "../components"
import { dispatchRef } from "../navigation"
import { CommonStyles } from "../components/styles/common/styles"
import { TabBarBottomKeyboardAward } from "../components/ui/TabBarComponent"
import { layoutSize } from "../constants/layoutSize"

export const tabNavigator = routes =>
	TabNavigator(routes, {
		swipeEnabled: true,
		tabBarComponent: TabBarBottomKeyboardAward,
		tabBarOptions: {
			activeTintColor: CommonStyles.mainColorTheme,
			inactiveTintColor: CommonStyles.mainColorTheme,
			indicatorStyle: {
				backgroundColor: "#ffffff",
			},
			labelStyle: {
				color: CommonStyles.textTabBottomColor,
				fontFamily: CommonStyles.primaryFontFamily,
				fontSize: layoutSize.LAYOUT_12,
			},
			showIcon: true,
			showLabel: true,
			style: {
				backgroundColor: CommonStyles.tabBottomColor,
				borderTopColor: CommonStyles.borderColorLighter,
				borderTopWidth: 1,
				elevation: 1,
				height: layoutSize.LAYOUT_50,
			},
			upperCaseLabel: false,
		},
		tabBarPosition: "bottom",
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
		tabBarOptions: {
			indicatorStyle: {
				backgroundColor: CommonStyles.selectColor,
			},
			labelStyle: {
				fontSize: layoutSize.LAYOUT_13,
			},
			showIcon: true,
			showLabel: false,
			style: {
				backgroundColor: CommonStyles.tabBackgroundColor,
			},
		},
		tabBarPosition: "top",
	})

const TabBarLbel = style.text(
	{
		alignSelf: "center",
		fontFamily: CommonStyles.primaryFontFamily,
		fontSize: layoutSize.LAYOUT_12,
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
	tabBarIcon: ({ focused }) => <IconOnOff name={iconName} focused={focused} />,
	tabBarLabel: ({ focused }) => <TabBarLbel focused={focused}>{title}</TabBarLbel>,
	tabBarOptions: {
		labelStyle: {
			color: CommonStyles.textTabBottomColor,
			fontFamily: CommonStyles.primaryFontFamily,
			fontSize: layoutSize.LAYOUT_10,
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
			alignSelf: "center",
			color: "white",
			fontFamily: CommonStyles.primaryFontFamily,
			fontSize: layoutSize.LAYOUT_16,
			fontWeight: "400",
			textAlign: "center",
		},
		headerTintColor: "white",
		...props,
	}
}
export const navigate = (route, props = {}) => {
	return dispatchRef(NavigationActions.navigate({ routeName: route, params: props }))
}
