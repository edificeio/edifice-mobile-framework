import * as React from "react"
import {StackNavigator, TabNavigator} from "react-navigation"
import { NavIcon } from "../components"
import {
	color,
	selectColor,
	tabBackgroundColor,
} from "../components/styles"
import { CommonStyles } from "../components/styles/common/styles"
import { layoutSize } from "../constants/layoutSize"


export const navigator = routes =>
	TabNavigator(routes, {
		backBehavior: "none",
		swipeEnabled: true,
		tabBarPosition: "bottom",
		tabBarOptions: {
			activeTintColor: CommonStyles.mainColorTheme,
			inactiveTintColor: CommonStyles.mainColorTheme,
			labelStyle: {
				fontSize: layoutSize.LAYOUT_8,
                color: CommonStyles.textTabBottomColor,
			},
			style: {
				backgroundColor: CommonStyles.tabBottomColor,
				borderTopWidth: 0,
				elevation: 0,
			},
			indicatorStyle: {
				backgroundColor: CommonStyles.mainColorTheme, //hidden
			},
			showLabel: true,
			upperCaseLabel: false,
			showIcon: true,
		},
	})

export const stackNavigator = route =>
	StackNavigator( route, {
/*		navigationOptions: {
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
        }
*/	})


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
                backgroundColor: tabBackgroundColor,
            },
            indicatorStyle: {
                backgroundColor: selectColor,
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
	tabBarLabel: title,
	tabBarIcon: <NavIcon tintColor={color} name={iconName} />,
})

export const navOptions = props => {
	return {
		...props,
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
	}
}

