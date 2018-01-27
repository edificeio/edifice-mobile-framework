import React from "react"
import { addNavigationHelpers } from "react-navigation"
import { connect } from "react-redux"
import AppNavigator from "./AppNavigator"

export function getCurrentRouteName(navigationState) {
	if (!navigationState) {
		return null
	}
	const route = navigationState.routes[navigationState.index]
	if (route.routes) {
		return getCurrentRouteName(route)
	}
	return route.routeName
}

export let dispatchRef

const Navigation = props => (
	<AppNavigator
		ref={nav => {
			dispatchRef = props.dispatch
		}}
		navigation={addNavigationHelpers({
			dispatch: props.dispatch,
			state: props.navigation,
		})}
	/>
)

const mapStateToProps = state => ({
	navigation: state.navigation,
})

const mapDispatchToProps = dispatch => ({
	dispatch,
})

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)
